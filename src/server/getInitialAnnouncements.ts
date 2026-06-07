import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';
import { fetchAnnouncementsForViewer } from '@/server/announcements/fetchAnnouncementsForViewer';

async function getInitialAnnouncementsWithPrivateCache(
    hackathonId: number,
    userId: number,
    viewAll = false
) {
    'use cache: private';
    cacheTag(`announcements-${hackathonId}-${userId}`);
    cacheLife({ stale: 30 });

    const result = await fetchAnnouncementsForViewer({
        hackathonId,
        userId,
        limit: 10,
        viewAll,
    });
    return { items: result.items, hasMore: result.nextCursor !== null };
}

export const getInitialAnnouncements = cache(
    getInitialAnnouncementsWithPrivateCache
);
