import NextAuth from 'next-auth';
import { authProviders } from './authProviders';

export const {} = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: authProviders,
    callbacks: {
        signIn: async ({ account, profile, email }) => {
            return true;
        },
    },
});
