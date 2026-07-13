import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { magicLink } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { cache } from 'react';
import { max } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { account, session, verification } from '@/db/schema/auth';
import { user } from '@/db/schema/users/users';
import { transporter } from '@/server/nodemailerTransporter';
import { getSixDigitId, userRNGParams } from '@/lib/PRNG/LCG';
import { authConfig } from './authConfig';
import { getAuthBaseUrl } from './authBaseUrl';
import { magicLinkEmailHtml } from './magicLinkEmail';

const authSecret =
    process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '';

export const auth = betterAuth({
    secret: authSecret,
    baseURL: getAuthBaseUrl(),
    database: drizzleAdapter(databaseClient, {
        provider: 'pg',
        camelCase: true,
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    advanced: {
        trustedProxyHeaders: true,
        database: {
            generateId: (options) => {
                if (options.model === 'user') {
                    return false;
                }
                return crypto.randomUUID();
            },
        },
    },
    ...authConfig,
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                await new Promise<void>((resolve, reject) => {
                    transporter.verify((err, suc) => {
                        if (err) {
                            reject(err);
                        } else if (suc) {
                            resolve();
                        } else {
                            reject(new Error('verify transporter bad result'));
                        }
                    });
                });

                const host = new URL(url).host;

                await new Promise<void>((resolve, reject) => {
                    transporter.sendMail(
                        {
                            to: email,
                            from: process.env.SENDINGEMAIL,
                            subject: 'Sign in!',
                            text: `sign in to ${host}`,
                            html: magicLinkEmailHtml({ url, host }),
                        },
                        (error, info) => {
                            if (error) {
                                reject(error);
                            } else if (info) {
                                resolve();
                            } else {
                                reject(new Error('bad send result'));
                            }
                        }
                    );
                });
            },
        }),
        nextCookies(),
    ],
    databaseHooks: {
        user: {
            create: {
                before: async (userData) => {
                    const [row] = await databaseClient
                        .select({ nextId: max(user.id) })
                        .from(user);
                    const index = (row?.nextId ?? 0) + 1;
                    const displayId = getSixDigitId(index, userRNGParams);

                    return {
                        data: {
                            ...userData,
                            displayId,
                        },
                    };
                },
            },
        },
    },
});

export interface SessionType {
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
    expires: string;
    userId: string;
}

function isAbortError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    if (error.message.includes('aborted')) {
        return true;
    }

    const sourceError = (error as { sourceError?: Error }).sourceError;
    return sourceError?.name === 'AbortError';
}

export const getSession = cache(async (): Promise<SessionType | null> => {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });

            if (!session) {
                return null;
            }

            return {
                user: {
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image ?? null,
                },
                expires: session.session.expiresAt.toISOString(),
                userId: String(session.user.id),
            };
        } catch (error) {
            if (isAbortError(error) && attempt === 0) {
                continue;
            }
            throw error;
        }
    }

    return null;
});
