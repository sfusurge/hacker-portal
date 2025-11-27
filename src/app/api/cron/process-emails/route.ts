import { NextRequest, NextResponse } from 'next/server';
import { databaseClient } from '@/db/client';
import { emailQueue, emailTemplates } from '@/db/schema/emails';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import { transporter } from '@/server/nodemailerTransporter';
import generateQRCode from '@/server/generateQRCode';
import { prepareEmailContent } from '@/app/(auth)/admin/email/templates/emailPreview';
import { getFileFromR2 } from '@/lib/cloudflare/r2';
const env = process.env;

export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get one pending email from queue
        const [pendingEmail] = await databaseClient
            .select()
            .from(emailQueue)
            .where(eq(emailQueue.status, 'pending'))
            .limit(1);

        if (!pendingEmail) {
            return NextResponse.json({ message: 'No pending emails' });
        }

        // Get template
        const [template] = await databaseClient
            .select()
            .from(emailTemplates)
            .where(eq(emailTemplates.id, pendingEmail.templateId))
            .limit(1);

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

        let processedTemplateContent = template.content;
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

                processedTemplateContent = processedTemplateContent.replace(
                    /{{qrCode}}/g,
                    qrCodeImgTag
                );
            } catch (qrError) {
                // Replace the placeholder with empty string if QR generation fails
                console.error('Error generating QR code:', qrError);
                processedTemplateContent = processedTemplateContent.replace(
                    /{{qrCode}}/g,
                    ''
                );
            }
        }

        if (template.attachments && Array.isArray(template.attachments)) {
            for (const attachment of template.attachments) {
                try {
                    const fileData = await getFileFromR2(
                        attachment.key,
                        process.env.NEXT_PUBLIC_R2_BUCKET_EMAILS ?? ''
                    );

                    attachments.push({
                        filename: attachment.fileName,
                        content: Buffer.from(fileData.buffer),
                        contentType: fileData.contentType,
                    });
                } catch (error) {
                    console.error(
                        `Error retrieving attachment ${attachment.key}:`,
                        error
                    );
                }
            }
        }

        const [userData] = await databaseClient
            .select()
            .from(user)
            .where(eq(user.id, pendingEmail.userId))
            .limit(1);

        const templateData = {
            firstName: userData.firstName ?? pendingEmail.firstName ?? 'Friend',
            lastName: userData.lastName ?? pendingEmail.lastName ?? '',
            email: userData.email ?? pendingEmail.email,
            userId: pendingEmail.userId,
        };

        const finalHtmlContent = prepareEmailContent(
            processedTemplateContent,
            templateData
        );

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

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error processing or sending email:', err);

        try {
            const [pendingEmail] = await databaseClient
                .select()
                .from(emailQueue)
                .where(eq(emailQueue.status, 'pending'))
                .limit(1);

            if (pendingEmail) {
                await databaseClient
                    .update(emailQueue)
                    .set({
                        status: 'failed',
                        errorMessage:
                            err instanceof Error
                                ? err.message
                                : 'Unknown error',
                        sentAt: new Date(),
                    })
                    .where(eq(emailQueue.id, pendingEmail.id));
            }
        } catch (updateError) {
            console.error('Error updating failed status:', updateError);
        }

        throw new Error('Failed to send email.');
    }
}
