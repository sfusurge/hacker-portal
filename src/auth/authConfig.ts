import { databaseClient } from '@/db/client';

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { NextAuthConfig } from 'next-auth';

import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import DiscordProvider from 'next-auth/providers/discord';
import { FigmaProvider } from './FigmaProvider';

export const authConfig = {
    adapter: DrizzleAdapter(databaseClient),
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
        GithubProvider({
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
        DiscordProvider({
            clientId: process.env.AUTH_DISCORD_ID as string,
            clientSecret: process.env.AUTH_DISCORD_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
        FigmaProvider({
            clientId: process.env.AUTH_FIGMA_ID as string,
            clientSecret: process.env.AUTH_FIGMA_SECRET as string,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
} satisfies NextAuthConfig;
