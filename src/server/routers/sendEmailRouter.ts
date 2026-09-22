import { protectedProcedure, router } from '../trpc';
import generateQRCode from '../generateQRCode';
import { sendEmailSchema } from '@/db/schema/emails';
import { transporter } from '@/server/nodemailerTransporter';
import { databaseClient } from '@/db/client';
import { emailTemplates, emailTemplateStyling } from '@/db/schema/emails';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import type { SendMailOptions, SentMessageInfo } from 'nodemailer';
import {
    prepareEmailContent,
    mergeBodyIntoStyling,
    markdownToHtml,
} from '@/app/(auth)/admin/email/templates/emailPreview';
import { TRPCError } from '@trpc/server';
import { hasAdminAccess } from '@/lib/auth/roles';
import { z } from 'zod';

const env = process.env;

function sendMailAsync(options: SendMailOptions): Promise<SentMessageInfo> {
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => {
            if (error) reject(error);
            else resolve(info);
        });
    });
}

type SendEmailInput = z.infer<typeof sendEmailSchema>;

/** Server-only send path for webhooks / RSVP result pages (no session). */
export async function sendTemplatedEmail(
    input: SendEmailInput
): Promise<{ emailSent: boolean }> {
    try {
        const [template] = await databaseClient
            .select()
            .from(emailTemplates)
            .where(eq(emailTemplates.id, input.templateId))
            .limit(1);

        if (!template) {
            console.error(
                `[sendEmail] template not found: id ${input.templateId}`
            );
            return { emailSent: false };
        }

        let processedTemplateContent =
            template.stylingId != null
                ? markdownToHtml(template.content)
                : template.content;
        let qrcodeBase64: string | undefined;
        const attachments: NonNullable<SendMailOptions['attachments']> = [];

        if (processedTemplateContent.includes('{{qrCode}}')) {
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
                console.error('[sendEmail] QR generation failed:', qrError);
                processedTemplateContent = processedTemplateContent.replace(
                    /{{qrCode}}/g,
                    ''
                );
            }
        }

        const [userData] = await databaseClient
            .select()
            .from(user)
            .where(eq(user.id, input.user.id))
            .limit(1);

        const templateData = {
            firstName: userData?.firstName ?? input.user.firstName ?? 'Friend',
            lastName: userData?.lastName ?? input.user.lastName ?? '',
            email: userData?.email ?? input.user.email,
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

        const mailOptions: SendMailOptions = {
            from: env.SENDINGEMAIL,
            to: input.user.email.trim(),
            subject: template.title,
            html: finalHtmlContent,
            attachments: attachments.length ? attachments : undefined,
        };

        try {
            await sendMailAsync(mailOptions);
            return { emailSent: true };
        } catch (sendErr) {
            console.error('[sendEmail] SMTP error:', sendErr);
            return { emailSent: false };
        }
    } catch (err) {
        console.error('[sendEmail] processing error:', err);
        return { emailSent: false };
    }
}

export const sendEmailRouter = router({
    sendEmail: protectedProcedure
        .input(sendEmailSchema)
        .mutation(async ({ input, ctx }): Promise<{ emailSent: boolean }> => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                ctx.user.id !== input.user.id
            ) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }
            return sendTemplatedEmail(input);
        }),
});

export type SendEmailRouter = typeof sendEmailRouter;
