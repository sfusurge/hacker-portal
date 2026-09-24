import { type NextRequest, NextResponse } from 'next/server';

// Use headers.append — cookies.set() overwrites same-name cookies across domains.

const SESSION_COOKIE = '__Secure-better-auth.session_token';
const SESSION_COOKIE_INSECURE = 'better-auth.session_token';
const EXPIRES = 'Thu, 01 Jan 1970 00:00:00 GMT';
const MAX_AGE = 60 * 60 * 24 * 90; // match authConfig session.expiresIn

function expire(response: NextResponse, name: string, domain?: string) {
    const secure = name.startsWith('__Secure-');
    let value = `${name}=; Path=/; Max-Age=0; Expires=${EXPIRES}; HttpOnly; SameSite=Lax`;
    if (secure) value += '; Secure';
    if (domain) value += `; Domain=${domain}`;
    response.headers.append('Set-Cookie', value);
}

function sharedDomain(): string | undefined {
    const raw = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim();
    if (!raw) return undefined;
    return raw.startsWith('.') ? raw : `.${raw}`;
}

// Clear portal host-only session cookie.
export function expireLegacyPortalAuthCookies(
    _request: NextRequest,
    response: NextResponse
) {
    if (!sharedDomain()) return;
    expire(response, SESSION_COOKIE);
    expire(response, SESSION_COOKIE_INSECURE);
    expire(response, SESSION_COOKIE, 'portal.sfusurge.com');
    expire(response, SESSION_COOKIE_INSECURE, 'portal.sfusurge.com');
}

// Clear session cookie on every scope (logout).
export function expireAllAuthCookies(
    _request: NextRequest,
    response: NextResponse
) {
    const shared = sharedDomain();
    for (const name of [SESSION_COOKIE, SESSION_COOKIE_INSECURE]) {
        expire(response, name);
        expire(response, name, 'portal.sfusurge.com');
        if (shared) {
            expire(response, name, shared.slice(1));
            expire(response, name, shared);
        }
    }
}

// Move session token to .sfusurge.com and drop the host-only portal cookie.
export function migrateSessionCookieToSharedDomain(
    request: NextRequest,
    response: NextResponse
) {
    const domain = sharedDomain();
    if (!domain) return;

    const token =
        request.cookies.get(SESSION_COOKIE)?.value ??
        request.cookies.get(SESSION_COOKIE_INSECURE)?.value;
    if (!token) return;

    response.headers.append(
        'Set-Cookie',
        `${SESSION_COOKIE}=${token}; Path=/; Domain=${domain}; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
    );
    expireLegacyPortalAuthCookies(request, response);
}
