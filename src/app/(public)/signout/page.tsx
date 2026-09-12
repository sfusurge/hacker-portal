'use client';

import { signOutAndRedirect, useAuthSession } from '@/auth/auth-client';
import { useEffect } from 'react';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { resetPostHogUser } from '@/lib/analytics/posthog';

// Force sign-out client side (and delete cookie), e.g. when a live session
// doesn't refer to a valid user in the db.
export default function SignOutPage() {
    const session = useAuthSession();

    useEffect(() => {
        if (session.status === 'loading') return;

        resetPostHogUser();
        void signOutAndRedirect('/login');
    }, [session.status]);

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
