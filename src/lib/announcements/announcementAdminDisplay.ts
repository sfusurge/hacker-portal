import type { AnnouncementWithAttachments } from '@/db/schema/announcements';

export function announcementAdminDisplayName(
    announcement: AnnouncementWithAttachments,
    hackathonName: string
): string {
    const channel = announcement.channelLabel?.trim() || hackathonName;
    const location = announcement.channelLocationKey?.trim();
    if (!location) return channel;
    return `${channel} (${location})`;
}
