import { cache } from 'react';
import { fetchAnnouncementsForViewer } from '@/server/announcements/fetchAnnouncementsForViewer';

// TODO: replace cache() with 'use cache: private' (opennextjs/opennextjs-cloudflare#1450)
async function getInitialAnnouncementsForViewer(
    hackathonId: number,
    userId: number,
    viewAll = false
) {
    const result = await fetchAnnouncementsForViewer({
        hackathonId,
        userId,
        limit: 10,
        viewAll,
    });
    return { items: result.items, hasMore: result.nextCursor !== null };
}

export const getInitialAnnouncements = cache(getInitialAnnouncementsForViewer);
