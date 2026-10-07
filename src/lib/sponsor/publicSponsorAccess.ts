import { redirect } from 'next/navigation';
import { isValidSponsorPublicAccessToken } from '@/lib/sponsor/publicAccessToken';

export function parseSponsorPublicToken(searchParams: {
    [key: string]: string | string[] | undefined;
}): string | null {
    const raw = searchParams.token ?? searchParams.tier;
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (!token?.trim() || !isValidSponsorPublicAccessToken(token)) return null;
    return token.trim();
}

/** Validate token from page searchParams or redirect to login. */
export function requireSponsorPublicToken(searchParams: {
    [key: string]: string | string[] | undefined;
}): string {
    const token = parseSponsorPublicToken(searchParams);
    if (!token) redirect('/login');
    return token;
}

export function withSponsorPublicToken(path: string, token: string): string {
    const url = new URL(path, 'http://local.invalid');
    url.searchParams.set('token', token);
    return `${url.pathname}${url.search}`;
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
