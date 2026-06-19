import { cache } from 'react';
import { fetchAnnouncementsForViewer } from '@/server/announcements/fetchAnnouncementsForViewer';

export const getInitialAnnouncements = cache(
    async (hackathonId: number, userId: number, viewAll = false) => {
        const result = await fetchAnnouncementsForViewer({
            hackathonId,
            userId,
            limit: 10,
            viewAll,
        });
        return { items: result.items, hasMore: result.nextCursor !== null };
    }
);
