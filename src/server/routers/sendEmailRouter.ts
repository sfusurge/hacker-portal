import { publicProcedure, router } from '../trpc';
import generateQRCode from '../generateQRCode';
import { sendEmailSchema } from '@/db/schema/emails';
import { transporter } from '@/server/nodemailerTransporter';
import { databaseClient } from '@/db/client';
import { emailTemplates } from '@/db/schema/emails';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import { prepareEmailContent } from '@/app/(auth)/admin/email/emailPreview';
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

                const finalHtmlContent = prepareEmailContent(
                    processedTemplateContent,
                    templateData
                );

                // --- Prepare Mail Options ---
                const mailOptions = {
                    from: env.SENDINGEMAIL,
                    to: input.user.email,
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
