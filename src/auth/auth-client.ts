'use client';

import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';
import { resolveAuthOrigin } from './authBaseUrl';

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
 * Navigate to the server sign-out route so every cookie domain scope
 * (host-only, portal host, and shared parent domain) can be expired.
 */
export function signOutAndRedirect(redirectTo = '/login') {
    try {
        localStorage.removeItem('auth-login-success');
    } catch {
        // ignore
    }
    const params = new URLSearchParams({ from: redirectTo });
    window.location.assign(`/api/auth/sign-out?${params}`);
}
