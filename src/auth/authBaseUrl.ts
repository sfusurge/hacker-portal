import type { BetterAuthOptions } from 'better-auth';

function isLoopbackUrl(url: string) {
    try {
        const { hostname } = new URL(url);
        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.endsWith('.localhost')
        );
    } catch {
        return false;
    }
}

/** Resolve auth base URL for local dev, Vercel previews, and production. */
export function getAuthBaseUrl(): BetterAuthOptions['baseURL'] {
    const explicit =
        process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL ?? undefined;

    if (explicit && !isLoopbackUrl(explicit)) {
        return explicit;
    }

    // VERCEL_URL changes every deployment (e.g. hacker-portal-g3pzjgacc-...).
    // VERCEL_BRANCH_URL is stable per branch (e.g. hacker-portal-git-development-...).
    if (process.env.VERCEL_BRANCH_URL) {
        return `https://${process.env.VERCEL_BRANCH_URL}`;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
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
