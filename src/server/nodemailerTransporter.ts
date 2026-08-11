import nodemailer from 'nodemailer';
const env = process.env;

// Host/port default to Gmail (production). Override with SMTP_HOST/SMTP_PORT/
// SMTP_SECURE to point at a local mail catcher like Mailpit for testing.
const host = env.SMTP_HOST ?? 'smtp.gmail.com';
const port = Number.parseInt(env.SMTP_PORT ?? '465', 10) || 465;
const secure = (env.SMTP_SECURE ?? 'true') === 'true';

// Local catchers (Mailpit/MailHog) accept mail with no auth; only send
// credentials when both are configured.
const auth =
    env.SENDINGEMAIL && env.EMAILPASS
        ? { user: env.SENDINGEMAIL, pass: env.EMAILPASS }
        : undefined;

export const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    pool: true,
    maxConnections: 1,
    maxMessages:
        Number.parseInt(
            process.env.SMTP_MAX_MESSAGES_PER_CONNECTION ?? '100',
            10
        ) || 100,
    greetingTimeout: 10000,
    auth,
});
