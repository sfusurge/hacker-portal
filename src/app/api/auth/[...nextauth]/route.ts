// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';
import { databaseClient } from '@/db/client';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema/users';
import { checkEmailExists } from '../middleware';

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: authProviders,
  callbacks: {
    async signIn({ user, account, profile, email }) {
      if (!user.email) {
        return false;
      }

      const emailExists = await checkEmailExists(user.email);
      if (emailExists) {
        return true;
      }
      return false;
    },
  },
});

export { handler as GET, handler as POST };
