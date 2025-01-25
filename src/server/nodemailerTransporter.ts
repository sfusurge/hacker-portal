import nodemailer from 'nodemailer';
const env = process.env;

export const transporter = nodemailer.createTransport({
    host: 'blizzard.mxrouting.net',
    port: 465,
    secure: true,
    auth: {
        user: env.SENDINGEMAIL,
        pass: env.EMAILPASS,
    },
});
