import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { createCaller } from '@/server/appRouter';

async function getActiveHackathon() {
    const trpcCaller = createCaller({});
    return trpcCaller.hackathons.getActiveHackathon();
}

// TODO: replace unstable_cache with 'use cache' (opennextjs/opennextjs-cloudflare#1450)
const getActiveHackathonCached = unstable_cache(
    getActiveHackathon,
    ['active-hackathon'],
    { tags: ['active-hackathon'], revalidate: 60 }
);

// caches the active hackathon across requests and deduplicates within a request.
export const getCachedActiveHackathon = cache(getActiveHackathonCached);
