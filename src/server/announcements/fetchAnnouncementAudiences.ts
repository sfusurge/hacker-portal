import { databaseClient } from '@/db/client';
import { announcementChannelMappings } from '@/db/schema/announcements';
import { formatEventLocationLabel } from '@/lib/applicationAcceptStatus';
import type { AnnouncementAudienceOption } from '@/lib/announcements/announcementAudience';
import { and, eq, isNotNull } from 'drizzle-orm';

export async function fetchAnnouncementAudiences(
    hackathonId: number
): Promise<AnnouncementAudienceOption[]> {
    const rows = await databaseClient
        .select({
            eventLocationKey: announcementChannelMappings.eventLocationKey,
        })
        .from(announcementChannelMappings)
        .where(
            and(
                eq(announcementChannelMappings.hackathonId, hackathonId),
                eq(announcementChannelMappings.isActive, true),
                isNotNull(announcementChannelMappings.eventLocationKey)
            )
        );

    const keys = new Set<string>();
    for (const row of rows) {
        const key = row.eventLocationKey?.trim().toLowerCase();
        if (key) keys.add(key);
    }

    const options: AnnouncementAudienceOption[] = [
        {
            locationKey: null,
            label: 'Virtual',
        },
        ...[...keys].sort().map((key) => ({
            locationKey: key,
            label: formatEventLocationLabel(key) || key,
        })),
    ];

    return options;
}
