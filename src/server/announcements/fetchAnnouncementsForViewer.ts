import { cache } from 'react';
import { databaseClient } from '@/db/client';
import {
    announcementAttachments,
    announcementChannelMappings,
    announcements,
} from '@/db/schema/announcements';
import { applications } from '@/db/schema/applications';
import { hackathons } from '@/db/schema/hackathons';
import type { InputFormPageData } from '@/components/application_components/types';
import { getApplicationEventLocationKey } from '@/lib/applicationEventLocation';
import {
    and,
    asc,
    desc,
    eq,
    getTableColumns,
    inArray,
    isNull,
    lt,
    or,
    sql,
} from 'drizzle-orm';

type FetchParams = {
    hackathonId: number;
    userId: number | null;
    limit: number;
    cursor?: number;
    viewAll?: boolean;
    previewLocationKey?: string | null;
};

async function getViewerAnnouncementLocationKeyUncached(
    hackathonId: number,
    userId: number
): Promise<string | null> {
    const [app] = await databaseClient
        .select({
            response: applications.response,
            applicationQuestions: hackathons.applicationQuestions,
        })
        .from(applications)
        .innerJoin(hackathons, eq(applications.hackathonId, hackathons.id))
        .where(
            and(
                eq(applications.hackathonId, hackathonId),
                eq(applications.userId, userId)
            )
        )
        .limit(1);
    if (!app) return null;
    return getApplicationEventLocationKey(
        app.response as Record<string, unknown>,
        app.applicationQuestions as InputFormPageData[]
    );
}

// deduped within a single RSC request
export const getViewerAnnouncementLocationKey = cache(
    async (
        hackathonId: number,
        userId: number | null
    ): Promise<string | null> => {
        if (userId == null) return null;
        return getViewerAnnouncementLocationKeyUncached(hackathonId, userId);
    }
);

function announcementVisibilityCondition(viewerLocationKey: string | null) {
    if (viewerLocationKey) {
        const k = viewerLocationKey.trim().toLowerCase();
        return or(
            isNull(announcementChannelMappings.id),
            isNull(announcementChannelMappings.eventLocationKey),
            sql`LOWER(${announcementChannelMappings.eventLocationKey}) = ${k}`
        );
    }
    return or(
        isNull(announcementChannelMappings.id),
        isNull(announcementChannelMappings.eventLocationKey)
    );
}

export async function fetchAnnouncementsForViewer(input: FetchParams) {
    let viewerLocationKey: string | null = null;
    if (!input.viewAll) {
        if (input.previewLocationKey !== undefined) {
            viewerLocationKey = input.previewLocationKey;
        } else {
            viewerLocationKey = await getViewerAnnouncementLocationKey(
                input.hackathonId,
                input.userId
            );
        }
    }

    const rows = await databaseClient
        .select({
            ...getTableColumns(announcements),
            channelLabel: announcementChannelMappings.label,
            channelLocationKey: announcementChannelMappings.eventLocationKey,
        })
        .from(announcements)
        .leftJoin(
            announcementChannelMappings,
            eq(
                announcements.sourceChannelId,
                announcementChannelMappings.discordChannelId
            )
        )
        .where(
            and(
                eq(announcements.hackathonId, input.hackathonId),
                eq(announcements.isArchived, false),
                input.viewAll
                    ? undefined
                    : announcementVisibilityCondition(viewerLocationKey),
                input.cursor !== undefined
                    ? lt(announcements.id, input.cursor)
                    : undefined
            )
        )
        .orderBy(desc(announcements.id))
        .limit(input.limit + 1);

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    if (items.length === 0) {
        return { items: [], nextCursor: null };
    }

    const announcementIds = items.map((row) => row.id);

    const attachmentRows = await databaseClient
        .select()
        .from(announcementAttachments)
        .where(inArray(announcementAttachments.announcementId, announcementIds))
        .orderBy(
            asc(announcementAttachments.announcementId),
            asc(announcementAttachments.position)
        );

    const attachmentsByAnnouncement = new Map<number, typeof attachmentRows>();
    for (const attachment of attachmentRows) {
        const list =
            attachmentsByAnnouncement.get(attachment.announcementId) ?? [];
        list.push(attachment);
        attachmentsByAnnouncement.set(attachment.announcementId, list);
    }

    return {
        items: items.map((row) => ({
            ...row,
            attachments: attachmentsByAnnouncement.get(row.id) ?? [],
        })),
        nextCursor,
    };
}
