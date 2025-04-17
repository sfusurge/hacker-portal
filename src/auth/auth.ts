import NextAuth from 'next-auth';
import { user, addUser } from '@/db/schema/users/users';
import { authConfig } from './authConfig';
import NodeMailerProvider from 'next-auth/providers/nodemailer';

import { eq } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { transporter } from '@/server/nodemailerTransporter';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        NodeMailerProvider({
            server: process.env.AUTH_MAIL_SERVER ?? '',
            from: process.env.SENDINGEMAIL,
            sendVerificationRequest: async ({ url, expires, identifier }) => {
                const host = new URL(url).host;
                const emailSignInRes = await transporter.sendMail(
                    {
                        to: identifier,
                        from: process.env.SENDINGEMAIL,
                        subject: 'Sign in!',
                        text: `sign in to ${host}`,
                        html: html({ url, host }),
                    },
                    (error, info) => {
                        if (error) {
                            console.log('auth email error: ', error);
                        } else {
                            console.log('auth email success: ', info);
                        }
                    }
                );

                console.log('email results:', emailSignInRes);
            },
        }),
    ],
    callbacks: {
        signIn: async ({ user: signinUser, profile, credentials, account }) => {
            if (!signinUser.email) {
                console.log(`bad login! signing out:  ${signinUser}`);

                // bad login, somehow
                return await signOut({
                    redirectTo: '/login',
                });
            }

            let dbUser = (
                await databaseClient
                    .select()
                    .from(user)
                    .where(eq(user.email, signinUser.email))
                    .limit(1)
            )[0];

            // logged in, but user doesn't exist in db, so lets make one.
            if (!dbUser) {
                const res = await addUser({
                    email: signinUser.email,
                });

                if (res) {
                    dbUser = {
                        ...res,
                        firstName: null,
                        lastName: null,
                        phoneNumber: null,
                    };
                }
            }

            return true;
        },
    },
});

function html(params: { url: string; host: string }) {
    const { url, host } = params;

    const escapedHost = host.replace(/\./g, '&#8203;.');

    const brandColor = '#346df1';
    const color = {
        background: '#f9f9f9',
        text: '#444',
        mainBackground: '#fff',
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: '#fff',
    };

    return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Sign in to <strong>${escapedHost}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                  in</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `;
}
