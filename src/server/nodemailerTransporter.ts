import nodemailer from 'nodemailer';
const env = process.env;

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 1,
    maxMessages:
        Number.parseInt(
            process.env.SMTP_MAX_MESSAGES_PER_CONNECTION ?? '100',
            10
        ) || 100,
    greetingTimeout: 10000,
    auth: {
        user: env.SENDINGEMAIL,
        pass: env.EMAILPASS,
    },
});
