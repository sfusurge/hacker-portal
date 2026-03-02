import { publicProcedure, router } from '../trpc';
import generateQRCode from '../generateQRCode';
import { sendEmailSchema } from '@/db/schema/emails';
import { transporter } from '@/server/nodemailerTransporter';
import { databaseClient } from '@/db/client';
import { emailTemplates, emailTemplateStyling } from '@/db/schema/emails';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import {
    prepareEmailContent,
    mergeBodyIntoStyling,
    markdownToHtml,
} from '@/app/(auth)/admin/email/templates/emailPreview';
import { getFileFromR2 } from '@/lib/cloudflare/r2';
const env = process.env;

export const sendEmailRouter = router({
    sendEmail: publicProcedure
        .input(sendEmailSchema)
        .mutation(async ({ input }) => {
            try {
                const [template] = await databaseClient
                    .select()
                    .from(emailTemplates)
                    .where(eq(emailTemplates.id, input.templateId))
                    .limit(1);

                if (!template) {
                    throw new Error(
                        `Email template with ID "${input.templateId}" not found`
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
                            input.user.id.toString(),
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

                if (
                    template.attachments &&
                    Array.isArray(template.attachments)
                ) {
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
                    .where(eq(user.id, input.user.id))
                    .limit(1);

                const templateData = {
                    firstName:
                        userData.firstName ?? input.user.firstName ?? 'Friend',
                    lastName: userData.lastName ?? input.user.lastName ?? '',
                    email: userData.email ?? input.user.email,
                    userId: input.user.id,
                };

                let finalHtmlContent = prepareEmailContent(
                    processedTemplateContent,
                    templateData
                );

                if (template.stylingId != null) {
                    const [styling] = await databaseClient
                        .select()
                        .from(emailTemplateStyling)
                        .where(eq(emailTemplateStyling.id, template.stylingId))
                        .limit(1);
                    if (styling?.html) {
                        finalHtmlContent = mergeBodyIntoStyling(
                            styling.html,
                            finalHtmlContent
                        );
                    }
                }

                const mailOptions = {
                    from: env.SENDINGEMAIL,
                    to: input.user.email.trim(),
                    subject: template.title,
                    html: finalHtmlContent,
                    attachments: attachments,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });

                return { success: true };
            } catch (err) {
                console.error('Error processing or sending email:', err);
                throw new Error('Failed to send email.');
            }
        }),
});

export type SendEmailRouter = typeof sendEmailRouter;
