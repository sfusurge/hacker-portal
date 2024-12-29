// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';
import { createOAuthUser, validateUser } from '../middleware';

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: authProviders,
  callbacks: {
    async signIn({ account, profile, email }) {
      // OAuth
      if (account && profile?.email) {
        const isUserValid = await validateUser(profile.email, account.provider);
        if (isUserValid === true) return true;
        if (isUserValid === 'DNE') {
          console.log('ERROR: User does not exist');
          createOAuthUser(profile.email, account.provider);
          return true;
        }
        if (isUserValid === 'ProviderMismatch') {
          console.log('ERROR: Provider mismatch');
          return false;
        }
      }
      return false;
    },
  },
});

export { handler as GET, handler as POST };
