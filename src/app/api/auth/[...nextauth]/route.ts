// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';
import { databaseClient } from '@/db/client';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema/users';

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: authProviders,
  callbacks: {
    async signIn({ user, account, profile, email }) {
      // process.stdout.write(JSON.stringify(account));
      if (!user.email) {
        return false;
      }
      const oauthEmail = user.email;
      const isRegistered = databaseClient
        .select()
        .from(users)
        .where(eq(users.email, oauthEmail));
      process.stdout.write(JSON.stringify(isRegistered));

      return true;
    },
  },
});

export { handler as GET, handler as POST };
