import { NextRequest, NextResponse } from 'next/server';
import { databaseClient } from '@/db/client';
import {
    emailQueue,
    emailTemplates,
    emailTemplateStyling,
} from '@/db/schema/emails';
import { user } from '@/db/schema/users/users';
import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import { transporter } from '@/server/nodemailerTransporter';
import generateQRCode from '@/server/generateQRCode';
import {
    prepareEmailContent,
    mergeBodyIntoStyling,
    markdownToHtml,
} from '@/app/(auth)/admin/email/templates/emailPreview';

const env = process.env;

// if email doesn't send, check if the error is because of SMTP login throttling
function isSmtpAuthThrottleError(err: unknown): boolean {
    if (err == null || typeof err !== 'object') {
        return false;
    }
    const e = err as {
        responseCode?: number;
        code?: string;
        response?: string;
        message?: string;
    };
    if (e.responseCode === 454) {
        return true;
    }
    const blob = `${e.response ?? ''} ${e.message ?? ''}`;
    return e.code === 'EAUTH' && /too many login|454/i.test(blob);
}

// max emails sent in the last 60 minutes
const rawHourly = parseInt(process.env.EMAIL_HOURLY_QUOTA ?? '100', 10);
const HOURLY_QUOTA = Number.isFinite(rawHourly) ? Math.max(0, rawHourly) : 100;

const MAX_RETRIES = parseInt(process.env.EMAIL_MAX_RETRIES ?? '3', 10);

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // pending emails
        const pendingPredicate = and(
            eq(emailQueue.status, 'pending'),
            lt(emailQueue.failedCount, MAX_RETRIES)
        );

        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const [sentCountResult] = await databaseClient
            .select({ count: sql<number>`count(*)` })
            .from(emailQueue)
            .where(
                and(
                    eq(emailQueue.status, 'sent'),
                    gte(emailQueue.sentAt, hourAgo)
                )
            );

        const sentInHour = Number(sentCountResult?.count ?? 0);
        const remainingHourlyQuota = Math.max(0, HOURLY_QUOTA - sentInHour);

        if (remainingHourlyQuota === 0) {
            return NextResponse.json({
                message:
                    HOURLY_QUOTA === 0
                        ? 'EMAIL_HOURLY_QUOTA is zero (sending disabled)'
                        : 'Hourly quota reached',
                hourlyQuota: HOURLY_QUOTA,
                sentInLastHour: sentInHour,
            });
        }

        const pendingEmails = await databaseClient
            .select()
            .from(emailQueue)
            .where(pendingPredicate)
            .limit(remainingHourlyQuota);

        if (pendingEmails.length === 0) {
            return NextResponse.json({ message: 'No pending emails' });
        }

        const templateIds = [
            ...new Set(pendingEmails.map((e) => e.templateId)),
        ];
        const userIds = [...new Set(pendingEmails.map((e) => e.userId))];

        const templateRows = await databaseClient
            .select()
            .from(emailTemplates)
            .where(inArray(emailTemplates.id, templateIds));

        const userRows = await databaseClient
            .select()
            .from(user)
            .where(inArray(user.id, userIds));

        const templateById = new Map(templateRows.map((t) => [t.id, t]));
        const userById = new Map(userRows.map((u) => [u.id, u]));

        const stylingIds = [
            ...new Set(
                templateRows
                    .map((t) => t.stylingId)
                    .filter((id): id is number => id != null)
            ),
        ];

        const stylingRows =
            stylingIds.length > 0
                ? await databaseClient
                      .select()
                      .from(emailTemplateStyling)
                      .where(inArray(emailTemplateStyling.id, stylingIds))
                : [];

        const stylingById = new Map(stylingRows.map((s) => [s.id, s]));

        let sentCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (const pendingEmail of pendingEmails) {
            try {
                const template = templateById.get(pendingEmail.templateId);

                if (!template) {
                    // Mark as failed if template not found
                    await databaseClient
                        .update(emailQueue)
                        .set({
                            status: 'failed',
                            errorMessage: `Email template with ID "${pendingEmail.templateId}" not found`,
                            sentAt: new Date(),
                        })
                        .where(eq(emailQueue.id, pendingEmail.id));

                    throw new Error(
                        `Email template with ID "${pendingEmail.templateId}" not found`
                    );
                }

                // Body content with styling = Markdown → HTML; no styling = HTML as-is
                let processedTemplateContent =
                    template.stylingId != null
                        ? markdownToHtml(template.content)
                        : template.content;
                let qrcodeBase64: string | undefined;
                let attachments = [];

                // Only generate QR code if the template contains the placeholder
                if (processedTemplateContent.includes('{{qrCode}}')) {
                    // QRCode options
                    const opts = {
                        margin: 1,
                        scale: 10,
                        color: { dark: '#000000', light: '#FFFFFF' },
                    };

                    try {
                        const qrCodeDataUrl = await generateQRCode(
                            pendingEmail.userId.toString(),
                            opts
                        );
                        qrcodeBase64 = qrCodeDataUrl.replace(
                            /^data:image\/png;base64,/,
                            ''
                        );
                        console.log('QR code generated successfully');

                        // Add QR code as embedded image for display in email
                        attachments.push({
                            filename: 'qr-inline.png',
                            content: Buffer.from(qrcodeBase64, 'base64'),
                            cid: 'qrcode',
                        });

                        const qrCodeImgTag =
                            '<img src="cid:qrcode" alt="QR Code" style="display: block; max-width: 200px; height: auto; border: 0;" />';

                        processedTemplateContent =
                            processedTemplateContent.replace(
                                /{{qrCode}}/g,
                                qrCodeImgTag
                            );
                    } catch (qrError) {
                        // Replace the placeholder with empty string if QR generation fails
                        console.error('Error generating QR code:', qrError);
                        processedTemplateContent =
                            processedTemplateContent.replace(/{{qrCode}}/g, '');
                    }
                }

                const userData = userById.get(pendingEmail.userId);

                const templateData = {
                    firstName:
                        userData?.firstName ??
                        pendingEmail.firstName ??
                        'Friend',
                    lastName: userData?.lastName ?? pendingEmail.lastName ?? '',
                    email: userData?.email ?? pendingEmail.email,
                    userId: pendingEmail.userId,
                };

                let finalHtmlContent = prepareEmailContent(
                    processedTemplateContent,
                    templateData
                );

                if (template.stylingId != null) {
                    const styling = stylingById.get(template.stylingId);
                    if (styling?.html) {
                        finalHtmlContent = mergeBodyIntoStyling(
                            styling.html,
                            finalHtmlContent
                        );
                    }
                }

                const mailOptions = {
                    from: env.SENDINGEMAIL,
                    to: pendingEmail.email.trim(),
                    subject: template.title,
                    html: finalHtmlContent,
                    attachments: attachments,
                };

                await new Promise((resolve, reject) => {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error sending email:', error);
                            reject(error);
                        } else {
                            console.log('Email sent:', info.response);
                            resolve(info);
                        }
                    });
                });

                // Mark as sent
                await databaseClient
                    .update(emailQueue)
                    .set({ status: 'sent', sentAt: new Date() })
                    .where(eq(emailQueue.id, pendingEmail.id));

                sentCount++;
            } catch (emailErr) {
                if (isSmtpAuthThrottleError(emailErr)) {
                    errors.push(
                        'SMTP login throttled; remaining queue entries left pending.'
                    );
                    break;
                }
                // Mark individual email as failed if reached max retries
                failedCount++;
                const errorMessage =
                    emailErr instanceof Error
                        ? emailErr.message
                        : 'Unknown error';
                const newFailedCount = (pendingEmail.failedCount ?? 0) + 1;
                errors.push(
                    `Email ${pendingEmail.id}: ${errorMessage} (attempt ${newFailedCount}/${MAX_RETRIES})`
                );

                await databaseClient
                    .update(emailQueue)
                    .set({
                        status:
                            newFailedCount >= MAX_RETRIES
                                ? 'failed'
                                : 'pending',
                        failedCount: newFailedCount,
                        errorMessage: errorMessage,
                    })
                    .where(eq(emailQueue.id, pendingEmail.id));
            }
        } // end for loop

        return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            hourlyQuota: HOURLY_QUOTA,
            sentInLastHourBeforeRun: sentInHour,
            remainingHourlyQuotaAfterRun: Math.max(
                0,
                HOURLY_QUOTA - sentInHour - sentCount
            ),
            processedBatchSize: pendingEmails.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        console.error('Error processing emails:', err);
        throw new Error('Failed to process emails.');
    }
}
