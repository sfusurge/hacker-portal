// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';
import { checkEmailExists } from '../middleware';

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: authProviders,
  callbacks: {
    async signIn({ account, profile, email }) {
      // OAuth
      if (account && profile) {
        if (profile.email) {
          if (await checkEmailExists(profile.email)) {
            return true;
          }
        }
      }
      return false;
    },
  },
});

export { handler as GET, handler as POST };
