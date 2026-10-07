import { NextRequest, NextResponse } from 'next/server';
import {
    buildSponsorSessionCookie,
    findActiveTokenByRaw,
} from '@/lib/sponsor/sponsorSession';

function safeNextPath(next: string | null): string {
    if (!next || !next.startsWith('/') || next.startsWith('//')) {
        return '/sponsor';
    }
    if (next.startsWith('/sponsor/activate')) return '/sponsor';
    return next;
}

// Validate token, set httpOnly cookie, redirect to a clean URL.
export async function GET(req: NextRequest) {
    const rawToken = req.nextUrl.searchParams.get('token')?.trim();
    const next = safeNextPath(req.nextUrl.searchParams.get('next'));

    if (!rawToken) {
        return new NextResponse('Missing sponsor access token.', {
            status: 400,
            headers: { 'Referrer-Policy': 'no-referrer' },
        });
    }

    const token = await findActiveTokenByRaw(rawToken);
    if (!token) {
        return new NextResponse('Invalid or revoked sponsor access token.', {
            status: 401,
            headers: { 'Referrer-Policy': 'no-referrer' },
        });
    }

    const cookie = buildSponsorSessionCookie(rawToken);
    const res = NextResponse.redirect(new URL(next, req.url), 303);
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
}
