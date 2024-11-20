import nodemailer from 'nodemailer';
const env = process.env;

// Nodemailer transporter, basically configures which platform and account you want to use.
// Right now, we only have Gmail to test with, but you can't just put in your normal Gmail password.
// You have to generate a custom one for "unsecured platforms" see https://nodemailer.com/usage/using-gmail/
// and https://medium.com/@y.mehnati_49486/how-to-send-an-email-from-your-gmail-account-with-nodemailer-837bf09a7628

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.SENDINGEMAIL,
    pass: env.EMAILPASS,
  },
});
