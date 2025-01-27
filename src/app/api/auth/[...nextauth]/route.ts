// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';
import { createOAuthUser, validateUser } from '../middleware';
import { AuthenticationError } from '../errors';

const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET as string,
    providers: authProviders,
    callbacks: {
        async signIn({ account, profile, email }) {
            // OAuth
            if (account && profile?.email) {
                try {
                    await validateUser(profile.email, account.provider);
                    return true;
                } catch (error) {
                    if (error instanceof AuthenticationError) {
                        console.log(error);
                        if (error.name === 'USER_DOES_NOT_EXIST') {
                            createOAuthUser(profile.email, account.provider);
                            return true;
                        } else if (error.name === 'PROVIDER_MISMATCH') {
                            return false;
                        }
                    }
                }
            }
            return false;
        },
    },
});

export { handler as GET, handler as POST };
