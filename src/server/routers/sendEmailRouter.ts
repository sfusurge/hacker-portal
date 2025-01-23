import { publicProcedure, router } from '../trpc';
import generateQRCode from '../generateQRCode';
import { sendEmailSchema } from '@/db/schema/emails';
import { transporter } from '@/server/nodemailerTransporter';
const env = process.env;
import Handlebars from 'handlebars';
import { welcomeEmailTemplate } from './templates';

const validEmailTypes = ['WELCOMEJH2025', 'WAITLISTJH2025', 'REJECTJH2025'];

export const sendEmailRouter = router({
  sendEmail: publicProcedure
    .input(sendEmailSchema)
    .mutation(async ({ input }) => {
      try {
        if (validEmailTypes.includes(input.type)) {
          //QRCode options
          const opts = {
            margin: 1,
            scale: 10,
            color: { dark: '#000000', light: '#0000' },
          };

          //QRCode generation
          const qrcode: string = (
            await generateQRCode(input.user.id.toString(), opts)
          ).replace(/^data:image\/png;base64,/, '');
          let mailOptions = {};

          if (input.type === 'WELCOMEJH2025') {
            //Compile HTML template
            const template = Handlebars.compile(welcomeEmailTemplate);
            const htmlContent = template({
              firstName: input.user.name,
            });

            //Email transport options
            mailOptions = {
              from: env.SENDINGEMAIL,
              to: input.user.email,
              subject: 'Welcome to JourneyHacks ' + input.user.name,
              text: 'Welcome to JourneyHacks',
              attachments: [
                {
                  filename: 'qr.png',
                  content: Buffer.from(qrcode, 'base64'),
                  cid: 'qrcode',
                },
              ],
              html: htmlContent,
            };
          } else if (input.type === 'WAITLISTJH2025') {
            //Compile HTML template
            const template = Handlebars.compile(welcomeEmailTemplate);
            const htmlContent = template({
              firstName: input.user.name,
            });

            //Email transport options
            mailOptions = {
              from: env.SENDINGEMAIL,
              to: input.user.email,
              subject: "You've been waitlisted, " + input.user.name,
              text: 'Welcome to JourneyHacks',
              attachments: [
                {
                  filename: 'qr.png',
                  content: Buffer.from(qrcode, 'base64'),
                  cid: 'qrcode',
                },
              ],
              html: htmlContent,
            };
          } else if (input.type === 'REJECTJH2025') {
            //Compile HTML template
            const template = Handlebars.compile(welcomeEmailTemplate);
            const htmlContent = template({
              firstName: input.user.name,
            });

            //Email transport options
            mailOptions = {
              from: env.SENDINGEMAIL,
              to: input.user.email,
              subject: 'Get rejected lol ' + input.user.name,
              text: 'Welcome to JourneyHacks',
              attachments: [
                {
                  filename: 'qr.png',
                  content: Buffer.from(qrcode, 'base64'),
                  cid: 'qrcode',
                },
              ],
              html: htmlContent,
            };
          }
          //Send out email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        }
      } catch (err) {
        console.error('Error generating or sending email:', err);
      }
    }),
});

export type sendEmailRouter = typeof sendEmailRouter;
