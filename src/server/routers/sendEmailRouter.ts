import { publicProcedure, router } from '../trpc';
import generateQRCode from '../generateQRCode';
import { sendEmailSchema } from '@/db/schema/emails';
import { transporter } from '@/server/nodemailerTransporter';
const env = process.env;

export const sendEmailRouter = router({
  sendEmail: publicProcedure
    .input(sendEmailSchema)
    .mutation(async ({ input }) => {
      try {
        const qrcode = await generateQRCode(input.user.id.toString());

        const mailOptions = {
          from: env.SENDINGEMAIL,
          to: input.user.email,
          subject: 'Hello ' + input.user.first_name,
          text: 'Welcome to JourneyHacks',
          attachments: [
            {
              filename: 'qr.png',
              content: Buffer.from(qrcode, 'base64'),
              cid: 'qrcode',
            },
          ],
          html:
            '<strong>Welcome to JourneyHacks</strong>' +
            '<br>' +
            '<img src="cid:qrcode"/>',
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      } catch (err) {
        console.error('Error generating or sending email:', err);
      }
    }),
});

export type sendEmailRouter = typeof sendEmailRouter;
