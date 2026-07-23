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

/** Sign out via Better Auth client, then hard-navigate to clear RSC session UI. */
export async function signOutAndRedirect(redirectTo = '/login') {
    try {
        await authClient.signOut();
    } finally {
        try {
            localStorage.removeItem('auth-login-success');
        } catch {
            // ignore
        }
        window.location.assign(redirectTo);
    }
}
