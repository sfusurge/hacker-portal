import NextAuth from 'next-auth';
import { authConfig } from './authConfig';

/**
 * edgeAuth lacks NodeMailer option, which is not supported and edge runtime (such as nextjs proxy)
 */
export const { auth: edgeAuth } = NextAuth({
    ...authConfig,
});
