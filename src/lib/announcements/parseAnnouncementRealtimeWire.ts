import { type AnnouncementWithAttachments } from '@/db/schema/announcements';
import { z } from 'zod';

// Ably JSON wire format: ISO date strings coerced to Date.
const announcementRealtimeWireSchema = z
    .object({
        sourceTimestamp: z.coerce.date(),
        lastEditedAt: z.coerce.date().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        channelLabel: z.string().nullable(),
        attachments: z.array(
            z
                .object({
                    uploadedAt: z.coerce.date().nullable(),
                    createdAt: z.coerce.date(),
                })
                .passthrough()
        ),
    })
    .passthrough();

// Validate + revive Dates for announcements delivered over Ably.
export function parseAnnouncementRealtimeWire(
    data: unknown
): AnnouncementWithAttachments | null {
    const parsed = announcementRealtimeWireSchema.safeParse(data);
    if (!parsed.success) return null;
    return parsed.data as AnnouncementWithAttachments;
}
