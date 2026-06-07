import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';
import { createCaller } from '@/server/appRouter';

async function getActiveHackathonWithCache() {
    'use cache';
    cacheTag('active-hackathon');
    cacheLife('minutes');

    const trpcCaller = createCaller({});
    return trpcCaller.hackathons.getActiveHackathon();
}

// caches the active hackathon across requests and deduplicates within a request.
export const getCachedActiveHackathon = cache(getActiveHackathonWithCache);
