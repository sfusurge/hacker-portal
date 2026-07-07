import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
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
