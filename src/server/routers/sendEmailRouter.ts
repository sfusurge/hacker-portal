import { publicProcedure, router } from '../trpc';
import generateQRCode from '../generateQRCode';
import { sendEmailSchema } from '@/db/schema/emails';
import { transporter } from '@/server/nodemailerTransporter';
import { databaseClient } from '@/db/client';
import { emailTemplates } from '@/db/schema/emails';
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

                // QRCode options
                const opts = {
                    margin: 1,
                    scale: 10,
                    color: { dark: '#000000', light: '#FFFFFF' },
                };

                let qrcodeBase64: string | undefined;
                let attachments = [];

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

                    attachments.push({
                        filename: 'qr.png',
                        content: Buffer.from(qrcodeBase64, 'base64'),
                        cid: 'qrcode',
                    });
                } catch (qrError) {
                    console.error('Error generating QR code:', qrError);
                }

                let processedTemplateContent = template.content;
                const qrCodeImgTag =
                    '<img src="cid:qrcode" alt="QR Code" style="display: block; max-width: 200px; height: auto; border: 0;" />';

                if (qrcodeBase64) {
                    processedTemplateContent = processedTemplateContent.replace(
                        /{{qrCode}}/g,
                        qrCodeImgTag
                    );
                } else {
                    processedTemplateContent = processedTemplateContent.replace(
                        /{{qrCode}}/g,
                        ''
                    );
                }

                // Prepare data for Handlebars
                const templateData = {
                    firstName: input.user.name,
                    email: input.user.email,
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
