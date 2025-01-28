import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { NextResponse } from 'next/server';
import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

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
        signIn: async ({ user }) => {
            if (!user.email) {
                // bad login, somehow
                return await signOut({
                    redirectTo: '/login',
                });
            }

            const dbUser = (
                await databaseClient
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1)
            )[0];

            // logged in, but user doesn't exist in db, so lets make one.
            if (!dbUser) {
                await databaseClient.insert(users).values({
                    email: user.email,
                    userRole: 'user',
                });
            }

            return true;
        },
    },
});

export async function loginWithProvider(
    provider: 'google' | 'github',
    redirectTarget: string | undefined
) {
    const res = await signIn(provider, {
        redirect: redirectTarget !== undefined,
        redirectTo: redirectTarget,
    });

    console.log('login finished, res is: ', res);
}
