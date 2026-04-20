import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import {
    announcementAttachments,
    announcements,
} from '@/db/schema/announcements';
import { asc, desc, eq, inArray, and } from 'drizzle-orm';
import { InternalServerError } from '../exceptions';

export const announcementsRouter = router({
    getAnnouncements: publicProcedure
        .input(
            z.object({
                hackathonId: z.number(),
            })
        )
        .query(async ({ input }) => {
            try {
                const rows = await databaseClient
                    .select()
                    .from(announcements)
                    .where(
                        and(
                            eq(announcements.hackathonId, input.hackathonId),
                            eq(announcements.isArchived, false)
                        )
                    )
                    .orderBy(desc(announcements.sourceTimestamp));

                if (rows.length === 0) {
                    return [];
                }

                const announcementIds = rows.map((row) => row.id);

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

                return rows.map((row) => ({
                    ...row,
                    attachments: attachmentsByAnnouncement.get(row.id) ?? [],
                }));
            } catch (err) {
                console.error('Error fetching announcements:', err);
                throw new InternalServerError('Failed to fetch announcements');
            }
        }),
});
