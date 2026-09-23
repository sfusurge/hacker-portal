'use client';

import { signOutAndRedirect, useAuthSession } from '@/auth/auth-client';
import { useEffect } from 'react';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { resetPostHogUser } from '@/lib/analytics/posthog';

export default function SignOutContent({ redirectTo }: { redirectTo: string }) {
    const session = useAuthSession();

    useEffect(() => {
        if (session.status === 'loading') return;
        resetPostHogUser();
        void signOutAndRedirect(redirectTo);
    }, [session.status, redirectTo]);

    return (
        <div className="flex h-full min-h-dvh w-full flex-1 flex-col items-center justify-center">
            <FullPageInfo
                src="/login/sad-otter.webp"
                imageSize="md"
                imageAlt="A sad otter"
                title="Please wait while we sign you out..."
                body="Signing out..."
            />
        </div>
    );
}
