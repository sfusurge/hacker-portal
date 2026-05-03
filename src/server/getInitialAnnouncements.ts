import { cache } from 'react';
import { createCaller } from '@/server/appRouter';

/** Fetches announcements for the given hackathon, deduped per request via React cache. */
export const getInitialAnnouncements = cache(async (hackathonId: number) => {
    const trpc = createCaller({});
    return trpc.announcements.getAnnouncements({ hackathonId });
});
