'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import {
    capturePostHogPageview,
    initPostHog,
    isPostHogConfigured,
    posthog,
} from '@/lib/analytics/posthog';

if (typeof window !== 'undefined' && isPostHogConfigured()) {
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
    if (!isPostHogConfigured()) {
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
