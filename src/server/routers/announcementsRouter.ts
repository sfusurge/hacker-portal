import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import { InternalServerError } from '../exceptions';
import { getBasicUserInfo, getUserData } from './usersRouter';
import { fetchAnnouncementsForViewer } from '@/server/announcements/fetchAnnouncementsForViewer';

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
                const viewer = await getBasicUserInfo();
                return await fetchAnnouncementsForViewer({
                    hackathonId: input.hackathonId,
                    userId: viewer?.id ?? null,
                    limit: input.limit,
                    cursor: input.cursor,
                });
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
