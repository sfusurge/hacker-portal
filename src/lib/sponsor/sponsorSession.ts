import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { databaseClient } from '@/db/client';
import { sponsorAccessTokens } from '@/db/schema/sponsorAccess';
import {
    SPONSOR_SESSION_COOKIE,
    SPONSOR_SESSION_MAX_AGE_SEC,
} from '@/lib/sponsor/tokenCrypto';

export type ActiveSponsorToken = {
    id: number;
    name: string;
    hackathonId: number | null;
};

// Look up a non-revoked sponsor by activate token.
export async function findActiveTokenByRaw(
    rawToken: string
): Promise<ActiveSponsorToken | null> {
    const token = rawToken.trim();
    if (!token) return null;

    const [row] = await databaseClient
        .select({
            id: sponsorAccessTokens.id,
            name: sponsorAccessTokens.name,
            hackathonId: sponsorAccessTokens.hackathonId,
        })
        .from(sponsorAccessTokens)
        .where(
            and(
                eq(sponsorAccessTokens.token, token),
                eq(sponsorAccessTokens.revoked, false)
            )
        )
        .limit(1);

    return row ?? null;
}

// Cookie stores the same activate token; validate against DB.
export async function getSponsorSessionFromCookies(): Promise<ActiveSponsorToken | null> {
    const jar = await cookies();
    const raw = jar.get(SPONSOR_SESSION_COOKIE)?.value?.trim();
    if (!raw) return null;
    return findActiveTokenByRaw(raw);
}

export async function requireSponsorSession(): Promise<ActiveSponsorToken> {
    const session = await getSponsorSessionFromCookies();
    if (!session) {
        const { redirect } = await import('next/navigation');
        redirect('/login');
        throw new Error('Unreachable');
    }
    return session;
}

export function buildSponsorSessionCookie(rawToken: string): {
    name: string;
    value: string;
    options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax';
        path: string;
        maxAge: number;
    };
} {
    return {
        name: SPONSOR_SESSION_COOKIE,
        value: rawToken.trim(),
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SPONSOR_SESSION_MAX_AGE_SEC,
        },
    };
}
