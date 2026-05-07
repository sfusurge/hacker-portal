import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import {
    announcementAttachments,
    announcementChannelMappings,
    announcements,
} from '@/db/schema/announcements';
import { user } from '@/db/schema/users/users';
import { asc, desc, eq, inArray, and, lt, getTableColumns } from 'drizzle-orm';
import { InternalServerError } from '../exceptions';
import { getUserData } from './usersRouter';

export const announcementsRouter = router({
    getAnnouncements: publicProcedure
        .input(
            z.object({
                hackathonId: z.number(),
                limit: z.number().int().min(1).max(100).default(10),
                cursor: z.number().int().optional(),
            })
        )
        .query(async ({ input }) => {
            try {
                const rows = await databaseClient
                    .select({
                        ...getTableColumns(announcements),
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
                    .where(
                        and(
                            eq(announcements.hackathonId, input.hackathonId),
                            eq(announcements.isArchived, false),
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
                    .where(
                        inArray(
                            announcementAttachments.announcementId,
                            announcementIds
                        )
                    )
                    .orderBy(
                        asc(announcementAttachments.announcementId),
                        asc(announcementAttachments.position)
                    );

                const attachmentsByAnnouncement = new Map<
                    number,
                    typeof attachmentRows
                >();
                for (const attachment of attachmentRows) {
                    const list =
                        attachmentsByAnnouncement.get(
                            attachment.announcementId
                        ) ?? [];
                    list.push(attachment);
                    attachmentsByAnnouncement.set(
                        attachment.announcementId,
                        list
                    );
                }

                return {
                    items: items.map((row) => ({
                        ...row,
                        attachments:
                            attachmentsByAnnouncement.get(row.id) ?? [],
                    })),
                    nextCursor,
                };
            } catch (err) {
                console.error('Error fetching announcements:', err);
                throw new InternalServerError('Failed to fetch announcements');
            }
        }),

    markSeen: publicProcedure
        .input(z.object({ lastSeenAt: z.coerce.date() }))
        .mutation(async ({ input }) => {
            const userData = await getUserData();
            if (!userData) return;
            await databaseClient
                .update(user)
                .set({ lastSeenAnnouncementsAt: input.lastSeenAt })
                .where(eq(user.id, userData.id));
        }),
});
