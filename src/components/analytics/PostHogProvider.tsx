'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import {
    capturePostHogPageview,
    initPostHog,
    posthog,
} from '@/lib/analytics/posthog';

if (typeof window !== 'undefined') {
    initPostHog();
}

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;
        const query = searchParams?.toString();
        const url =
            window.location.origin + pathname + (query ? `?${query}` : '');
        capturePostHogPageview(url);
    }, [pathname, searchParams]);

    return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        return <>{children}</>;
    }

    return (
        <PHProvider client={posthog}>
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </PHProvider>
    );
}
