function originFrom(raw: string | undefined, fallback: string) {
    if (!raw) return new URL(fallback).origin;
    const value = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
        return new URL(value).origin;
    } catch {
        return new URL(fallback).origin;
    }
}

const portalOrigin = originFrom(
    process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL,
    'https://portal.sfusurge.com'
);
const timeGamesOrigin = originFrom(
    process.env.TIME_GAMES_URL,
    'https://points.sfusurge.com'
);

/** Accept Portal-relative paths and the configured Time Games origin only. */
export function safePortalReturnTarget(value: unknown): string | undefined {
    if (typeof value !== 'string' || !value || value.length > 2048)
        return undefined;

    try {
        const target = new URL(value, portalOrigin);
        if (target.origin === portalOrigin) {
            return `${target.pathname}${target.search}${target.hash}`;
        }
        if (target.origin === timeGamesOrigin) {
            return target.toString();
        }
    } catch {
        return undefined;
    }

    return undefined;
}
