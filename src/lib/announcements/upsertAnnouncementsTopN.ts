import type { AnnouncementWithAttachments } from '@/db/schema/announcements';

export function upsertAnnouncementsTopN(
    prev: AnnouncementWithAttachments[],
    announcement: AnnouncementWithAttachments,
    limit: number
): AnnouncementWithAttachments[] {
    const next = [
        ...prev.filter((a) => a.id !== announcement.id),
        announcement,
    ];
    next.sort((a, b) => b.id - a.id);
    return next.slice(0, limit);
}
