import NextAuth from 'next-auth';
import { authProviders } from './authProviders';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: authProviders,
});
