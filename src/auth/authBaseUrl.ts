import type { BetterAuthOptions } from 'better-auth';

function isLoopbackHostname(hostname: string) {
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.localhost')
    );
}

/**
 * Normalize env / host values into an absolute http(s) origin.
 * Accepts: https://portal.sfusurge.com, portal.sfusurge.com, quoted values, trailing slash.
 */
export function normalizeOrigin(raw: string | undefined): string | undefined {
    if (!raw) return undefined;

    let value = raw.trim();
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        value = value.slice(1, -1).trim();
    }
    if (!value || value === '/' || value === 'undefined' || value === 'null') {
        return undefined;
    }

    if (!/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
    }

    try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return undefined;
        }
        return url.origin;
    } catch {
        return undefined;
    }
}

/** Always returns a concrete origin string (for createAuthClient / build-time). */
export function resolveAuthOrigin(): string {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    const candidates = [
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
        process.env.BETTER_AUTH_URL,
        process.env.NEXTAUTH_URL,
        process.env.VERCEL_ENV === 'production'
            ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ??
              'portal.sfusurge.com')
            : undefined,
        process.env.VERCEL_BRANCH_URL,
        process.env.VERCEL_URL,
        'http://localhost:3000',
    ];

    for (const candidate of candidates) {
        const origin = normalizeOrigin(candidate);
        if (origin) {
            return origin;
        }
    }

    return 'http://localhost:3000';
}

/** Resolve auth base URL for local dev, Vercel previews, and production. */
export function getAuthBaseUrl(): BetterAuthOptions['baseURL'] {
    const explicit = normalizeOrigin(
        process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL
    );

    if (explicit) {
        const { hostname } = new URL(explicit);
        if (!isLoopbackHostname(hostname)) {
            return explicit;
        }
    }

    // Production: custom domain (or default prod host), never the git-branch *.vercel.app URL.
    if (process.env.VERCEL_ENV === 'production') {
        return (
            normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
            'https://portal.sfusurge.com'
        );
    }

    // Preview deployments: stable branch URL, then deployment URL.
    const preview =
        normalizeOrigin(process.env.VERCEL_BRANCH_URL) ??
        normalizeOrigin(process.env.VERCEL_URL);
    if (preview) {
        return preview;
    }

    return {
        allowedHosts: [
            'localhost',
            'localhost:*',
            '127.0.0.1',
            '127.0.0.1:*',
            '*.vercel.app',
            'portal.sfusurge.com',
        ],
        fallback: explicit ?? 'http://localhost:3000',
        protocol: 'auto',
    };
}
