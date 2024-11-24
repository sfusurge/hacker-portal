// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import { authProviders } from '../authProviders';

export const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: authProviders,
});

export { handler as GET, handler as POST };
