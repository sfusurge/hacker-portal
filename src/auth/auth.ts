import NextAuth from 'next-auth';
import { users, addUser } from '@/db/schema/users/users';
import { authConfig } from './authConfig';
import NodeMailerProvider from 'next-auth/providers/nodemailer';

import { eq } from 'drizzle-orm';
import { databaseClient } from '@/db/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        NodeMailerProvider({
            server: process.env.AUTH_MAIL_SERVER,
            from: process.env.SENDINGEMAIL,
        }),
    ],
    callbacks: {
        signIn: async ({ user, profile, credentials, account }) => {
            if (!user.email) {
                console.log(`bad login! signing out:  ${user}`);

                // bad login, somehow
                return await signOut({
                    redirectTo: '/login',
                });
            }

            let dbUser = (
                await databaseClient
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1)
            )[0];

            // logged in, but user doesn't exist in db, so lets make one.
            if (!dbUser) {
                const res = await addUser({
                    email: user.email,
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
