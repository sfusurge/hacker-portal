import { randomBytes } from 'crypto';

export const SPONSOR_SESSION_COOKIE = 'sponsor_portal_session';

// Cookie lifetime; revoke in DB is what actually kills access.
export const SPONSOR_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 180;

export function generateSponsorToken(): string {
    return randomBytes(32).toString('base64url');
}
