import { cache } from 'react';
import { createCaller } from '@/server/appRouter';

/** caches the active hackathon for the current request for subsequent server requests */
export const getCachedActiveHackathon = cache(async () => {
    const trpcCaller = createCaller({});
    return trpcCaller.hackathons.getActiveHackathon();
});
