import { cache } from 'react';
import { createCaller } from '@/server/appRouter';

export const getInitialAnnouncements = cache(async (hackathonId: number) => {
    const trpc = createCaller({});
    const result = await trpc.announcements.getAnnouncements({
        hackathonId,
        limit: 10,
    });
    return { items: result.items, hasMore: result.nextCursor !== null };
});
