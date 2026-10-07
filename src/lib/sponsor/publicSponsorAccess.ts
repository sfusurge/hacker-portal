import { redirect } from 'next/navigation';
import {
    requireSponsorSession,
    type ActiveSponsorToken,
} from '@/lib/sponsor/sponsorSession';

export type { ActiveSponsorToken };

export function parseSponsorPublicToken(searchParams: {
    [key: string]: string | string[] | undefined;
}): string | null {
    const raw = searchParams.token ?? searchParams.tier;
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (!token?.trim()) return null;
    return token.trim();
}

// If ?token= is in the URL, swap it for a cookie via /sponsor/activate.
export function redirectTokenToActivate(
    searchParams: { [key: string]: string | string[] | undefined },
    nextPath: string
): void {
    const token = parseSponsorPublicToken(searchParams);
    if (!token) return;
    const params = new URLSearchParams({
        token,
        next: nextPath.startsWith('/') ? nextPath : '/sponsor',
    });
    redirect(`/sponsor/activate?${params.toString()}`);
}

export async function requireSponsorPublicAccessForPath(
    searchParams: { [key: string]: string | string[] | undefined },
    path: string
): Promise<ActiveSponsorToken> {
    redirectTokenToActivate(searchParams, path);
    return requireSponsorSession();
}

export const PUBLIC_SPONSOR_NAV = [
    {
        href: '/sponsor',
        label: 'Home',
        match: (p: string) => p === '/sponsor',
    },
    {
        href: '/sponsor/resumes',
        label: 'Resume Bank',
        match: (p: string) => p.startsWith('/sponsor/resumes'),
    },
    {
        href: '/sponsor/statistics',
        label: 'Statistics',
        match: (p: string) => p.startsWith('/sponsor/statistics'),
    },
] as const;
