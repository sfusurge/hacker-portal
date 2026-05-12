/** Ably channel + event used for hackathon-scoped announcement */
export const ANNOUNCEMENTS_ABLY_EVENT = 'announcement' as const;

export function announcementsChannelName(hackathonId: number): string {
    return `hackathon:${hackathonId}:announcements`;
}

export type AnnouncementRealtimePayload = {
    kind: 'created' | 'updated' | 'archived';
    hackathonId: number;
    announcementId: number;
};
