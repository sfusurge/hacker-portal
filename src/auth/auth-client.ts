import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';
import { resolveAuthOrigin } from './authBaseUrl';

// Pass an explicit origin on the server so createAuthClient does not read a bad
// BETTER_AUTH_URL from the env (that throws during prerender/build).
// In the browser, omit baseURL so requests stay same-origin via `/api/auth`
// (avoids localhost vs 127.0.0.1 vs LAN-IP mismatches that break sign-out).
export const authClient = createAuthClient({
    ...(typeof window === 'undefined' ? { baseURL: resolveAuthOrigin() } : {}),
    plugins: [magicLinkClient()],
});

export function useAuthSession() {
    const { data, isPending } = authClient.useSession();

    return {
        data,
        status: isPending
            ? ('loading' as const)
            : data
              ? ('authenticated' as const)
              : ('unauthenticated' as const),
    };
}

/**
 * Clear the Better Auth session and hard-navigate (avoids stale RSC/session UI).
 * Better Auth rejects POSTs without `Content-Type: application/json` (415),
 * which is why a bare fetch without that header leaves the session cookie intact.
 */
export async function signOutAndRedirect(redirectTo = '/login') {
    try {
        await authClient.signOut();
    } catch {
        try {
            await fetch('/api/auth/sign-out', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: '{}',
            });
        } catch {
            // Still leave the app even if the API call fails.
        }
    }

    try {
        localStorage.removeItem('auth-login-success');
    } catch {
        // ignore
    }

    window.location.assign(redirectTo);
}
