import type { BetterAuthOptions } from 'better-auth';

export const authConfig = {
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'github', 'discord', 'figma'],
            requireLocalEmailVerified: false,
        },
    },
    user: {
        additionalFields: {
            firstName: {
                type: 'string',
                required: false,
                input: true,
            },
            lastName: {
                type: 'string',
                required: false,
                input: true,
            },
            phoneNumber: {
                type: 'string',
                required: false,
                input: true,
            },
            displayId: {
                type: 'string',
                required: false,
                input: false,
            },
            userRole: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false,
            },
            lastSeenAnnouncementsAt: {
                type: 'date',
                required: false,
                input: false,
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        },
        github: {
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
        },
        discord: {
            clientId: process.env.AUTH_DISCORD_ID as string,
            clientSecret: process.env.AUTH_DISCORD_SECRET as string,
        },
        figma: {
            clientId: process.env.AUTH_FIGMA_ID as string,
            clientSecret: process.env.AUTH_FIGMA_SECRET as string,
        },
    },
} satisfies Pick<BetterAuthOptions, 'account' | 'user' | 'socialProviders'>;
