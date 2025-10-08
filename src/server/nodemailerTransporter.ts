import nodemailer from 'nodemailer';
const env = process.env;

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    greetingTimeout: 10000,
    auth: {
        user: env.SENDINGEMAIL,
        pass: env.EMAILPASS,
    },
});
