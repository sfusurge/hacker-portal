import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';

import { databaseClient } from '@/db/client';
import { addUser, users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { userOAuth } from '@/db/schema/userOAuth';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        }),
        GithubProvider({
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        signIn: async ({ user, profile, credentials, account }) => {
            if (!user.email) {
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

            if (dbUser) {
                // now check if the oauth provider is should be registered
                await databaseClient
                    .insert(userOAuth)
                    .values({
                        userId: dbUser.id,
                        provider: account?.provider,
                    })
                    .onConflictDoNothing();
            }

            return true;
        },
    },
});
