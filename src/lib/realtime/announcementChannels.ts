import type { AnnouncementRealtimeVisibility } from '@/lib/announcements/announcementRealtimeVisibility';

// ably channel + event used for hackathon-scoped announcement
export const ANNOUNCEMENTS_ABLY_EVENT = 'announcement' as const;

export function announcementsChannelName(hackathonId: number): string {
    return `hackathon:${hackathonId}:announcements`;
}

// serialized announcement JSON from Ably (Dates → ISO strings).
export type AnnouncementRealtimeWire = Record<string, unknown>;

export type AnnouncementRealtimePayload =
    | {
          kind: 'created' | 'updated';
          hackathonId: number;
          announcementId: number;
          announcement?: AnnouncementRealtimeWire;
          visibility?: AnnouncementRealtimeVisibility;
      }
    | {
          kind: 'archived';
          hackathonId: number;
          announcementId: number;
      };
