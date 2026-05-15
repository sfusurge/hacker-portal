import { databaseClient } from '@/db/client';
import {
    announcementAttachments,
    announcementChannelMappings,
    announcements,
    type AnnouncementWithAttachments,
} from '@/db/schema/announcements';
import type { AnnouncementRealtimeVisibility } from '@/lib/announcements/announcementRealtimeVisibility';
import { asc, eq, getTableColumns } from 'drizzle-orm';

export async function loadAnnouncementRealtimeSnapshot(
    announcementId: number
): Promise<{
    announcement: AnnouncementWithAttachments;
    visibility: AnnouncementRealtimeVisibility;
} | null> {
    const [row] = await databaseClient
        .select({
            ...getTableColumns(announcements),
            mappingId: announcementChannelMappings.id,
            mappingEventLocationKey:
                announcementChannelMappings.eventLocationKey,
            channelLabel: announcementChannelMappings.label,
        })
        .from(announcements)
        .leftJoin(
            announcementChannelMappings,
            eq(
                announcements.sourceChannelId,
                announcementChannelMappings.discordChannelId
            )
        )
        .where(eq(announcements.id, announcementId))
        .limit(1);

    if (!row) return null;

    const {
        mappingId,
        mappingEventLocationKey,
        channelLabel,
        ...announcementCols
    } = row;

    const attachmentRows = await databaseClient
        .select()
        .from(announcementAttachments)
        .where(eq(announcementAttachments.announcementId, announcementId))
        .orderBy(
            asc(announcementAttachments.announcementId),
            asc(announcementAttachments.position)
        );

    const announcement: AnnouncementWithAttachments = {
        ...announcementCols,
        channelLabel: channelLabel ?? null,
        attachments: attachmentRows,
    };

    const visibility: AnnouncementRealtimeVisibility = {
        mappingJoined: mappingId != null,
        mappingEventLocationKey: mappingEventLocationKey ?? null,
    };

    return { announcement, visibility };
}
