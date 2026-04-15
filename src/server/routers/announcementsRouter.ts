import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { announcements } from '@/db/schema/announcements';
import { desc, eq, and } from 'drizzle-orm';
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
                const results = await databaseClient
                    .select()
                    .from(announcements)
                    .where(
                        and(
                            eq(announcements.hackathonId, input.hackathonId),
                            eq(announcements.isArchived, false)
                        )
                    )
                    .orderBy(desc(announcements.sourceTimestamp));

                return results;
            } catch (err) {
                console.error('Error fetching announcements:', err);
                throw new InternalServerError('Failed to fetch announcements');
            }
        }),
});
