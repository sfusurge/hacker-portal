export const OAUTH_PROVIDERS = [
    'Google',
    'Discord',
    'Figma',
    'GitHub',
] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/** Local fallbacks when env URLs are unset. */
export const DEFAULT_LOGIN_BANNER_SRC = '/dashboard/sparkjamhead26.webp';
export const DEFAULT_LOGIN_ICON_SRC = '/dashboard/sparkjamhead.webp';

/**
 * Stable blob URLs preferred — overwrite the same paths to swap art
 * without redeploying code or hitting the DB for logged-out users.
 *
 * NEXT_PUBLIC_LOGIN_BANNER_URL → …/hackathons/login-banner.webp
 * NEXT_PUBLIC_LOGIN_ICON_URL   → …/hackathons/login-icon.webp
 */
export function getLoginBannerSrc(): string {
    const fromEnv = process.env.NEXT_PUBLIC_LOGIN_BANNER_URL?.trim();
    return fromEnv || DEFAULT_LOGIN_BANNER_SRC;
}

export function getLoginIconSrc(): string {
    const fromEnv = process.env.NEXT_PUBLIC_LOGIN_ICON_URL?.trim();
    return fromEnv || DEFAULT_LOGIN_ICON_SRC;
}
