'use client';

import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { identifyPostHogUser, POSTHOG_APP } from '@/lib/analytics/posthog';

/** Links PostHog persons to logged-in portal users (auth layout only). */
export function PostHogIdentify() {
    const user = useAtomValue(userInfoAtom);
    const hackathon = useAtomValue(hackathonAtom);

    useEffect(() => {
        if (!user?.id) return;

        identifyPostHogUser(user.id, {
            app: POSTHOG_APP,
            email: user.email,
            role: user.userRole,
            hackathon_id: hackathon?.id,
            hackathon_name: hackathon?.hackathonName ?? hackathon?.name,
        });
    }, [
        user?.id,
        user?.email,
        user?.userRole,
        hackathon?.id,
        hackathon?.hackathonName,
        hackathon?.name,
    ]);

    return null;
}
