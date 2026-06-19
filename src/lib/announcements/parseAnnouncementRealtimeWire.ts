import {
    type AnnouncementWithAttachments,
    selectAnnouncementAttachmentSchema,
    selectAnnouncementSchema,
} from '@/db/schema/announcements';
import { z } from 'zod';

/** JSON from Ably: ISO strings instead of Date; reuse Drizzle select shapes + coercion. */
const announcementRowWireSchema = selectAnnouncementSchema.extend({
    sourceTimestamp: z.coerce.date(),
    lastEditedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

const announcementAttachmentWireSchema =
    selectAnnouncementAttachmentSchema.extend({
        uploadedAt: z.coerce.date().nullable(),
        createdAt: z.coerce.date(),
    });

const announcementRealtimeWireSchema = announcementRowWireSchema.extend({
    channelLabel: z.string().nullable(),
    attachments: z.array(announcementAttachmentWireSchema),
});

/**
 * Validates + revives Dates for announcements delivered over Ably (JSON body).
 */
export function parseAnnouncementRealtimeWire(
    data: unknown
): AnnouncementWithAttachments | null {
    const parsed = announcementRealtimeWireSchema.safeParse(data);
    if (!parsed.success) return null;
    return parsed.data as AnnouncementWithAttachments;
}
