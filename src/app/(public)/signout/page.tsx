'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { resetPostHogUser } from '@/lib/analytics/posthog';

// this page is to force out signout client side (and delete cookie)
// such as when there is a live session that doesn't refer to a valid user in db.
export default function SignOutPage() {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session.status === 'loading') return;

        resetPostHogUser();

        if (session.status === 'authenticated') {
            void signOut({ redirect: false }).then(() => {
                router.replace('/login');
            });
        } else {
            router.replace('/login');
        }
    }, [session.status, router]);

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
