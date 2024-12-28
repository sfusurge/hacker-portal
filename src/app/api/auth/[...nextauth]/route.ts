// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';
import { checkEmailExists, createOAuthUser } from '../middleware';

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: authProviders,
  callbacks: {
    async signIn({ account, profile, email }) {
      // OAuth
      if (account && profile?.email) {
        const emailExists = await checkEmailExists(profile.email);
        if (!emailExists) {
          const newUser = createOAuthUser(profile.email, account.provider);
          console.log(newUser);
        }
        return true;
      }
      return false;
    },
  },
});

export { handler as GET, handler as POST };
