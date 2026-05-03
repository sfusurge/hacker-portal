import { cache } from 'react';
import { createCaller } from '@/server/appRouter';

export const getInitialAnnouncements = cache(async (hackathonId: number) => {
    const trpc = createCaller({});
    return trpc.announcements.getAnnouncements({ hackathonId });
});
