import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';

export const authProviders = [
    GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    GithubProvider({
        clientId: process.env.AUTH_GITHUB_ID as string,
        clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
];

export type ProvidersEnum = {
    GOOGLE: 'google';
    GITHUB: 'github';
};
