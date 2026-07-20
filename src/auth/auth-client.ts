import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';
import { resolveAuthOrigin } from './authBaseUrl';

// Pass an explicit origin so createAuthClient does not read a bad
// BETTER_AUTH_URL from the env (that throws during prerender/build).
// In the browser, always use the page origin so cookies stay same-site.
export const authClient = createAuthClient({
    baseURL:
        typeof window !== 'undefined'
            ? window.location.origin
            : resolveAuthOrigin(),
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

/** Clear the Better Auth session and hard-navigate (avoids stale RSC/session UI). */
export async function signOutAndRedirect(redirectTo = '/login') {
    try {
        await authClient.signOut();
    } catch {
        // Still leave the app even if the API call fails.
    }

    try {
        localStorage.removeItem('auth-login-success');
    } catch {
        // ignore
    }

    window.location.assign(redirectTo);
}
