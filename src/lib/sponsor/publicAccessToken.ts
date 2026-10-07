import { timingSafeEqual } from 'crypto';

/**
 * Shared-link tokens that unlock the public sponsor resume bank.
 * Set SPONSOR_PUBLIC_TOKEN to the raw token string.
 */
export function getSponsorPublicAccessTokens(): string[] {
    const raw = process.env.SPONSOR_PUBLIC_TOKEN?.trim();
    if (!raw) return [];
    return [raw];
}

function safeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
}

export function isValidSponsorPublicAccessToken(
    token: string | null | undefined
): boolean {
    if (!token?.trim()) return false;
    const candidate = token.trim();
    return getSponsorPublicAccessTokens().some((allowed) =>
        safeEqual(candidate, allowed)
    );
}
