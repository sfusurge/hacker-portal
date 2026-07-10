import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import { InternalServerError } from '../exceptions';
import { getUserData } from './usersRouter';
import { fetchAnnouncementAudiences } from '@/server/announcements/fetchAnnouncementAudiences';
import { fetchAnnouncementsForViewer } from '@/server/announcements/fetchAnnouncementsForViewer';
import { hasAdminAccess } from '@/lib/auth/roles';

export const announcementsRouter = router({
    getAnnouncements: publicProcedure
        .input(
            z.object({
                hackathonId: z.number(),
                limit: z.number().int().min(1).max(100).default(10),
                cursor: z.number().int().optional(),
                viewAll: z.boolean().optional(),
                previewLocationKey: z.string().nullable().optional(),
            })
        )
        .query(async ({ input }) => {
            try {
                const viewer = await getUserData();
                const isAdmin = hasAdminAccess(viewer?.userRole);
                const viewAll = isAdmin ? (input.viewAll ?? true) : false;
                const previewLocationKey =
                    isAdmin &&
                    !viewAll &&
                    input.previewLocationKey !== undefined
                        ? input.previewLocationKey
                        : undefined;
                return await fetchAnnouncementsForViewer({
                    hackathonId: input.hackathonId,
                    userId: viewer?.id ?? null,
                    limit: input.limit,
                    cursor: input.cursor,
                    viewAll,
                    previewLocationKey,
                });
            } catch (err) {
                console.error('Error fetching announcements:', err);
                throw new InternalServerError('Failed to fetch announcements');
            }
        }),

    getAnnouncementAudiences: publicProcedure
        .input(z.object({ hackathonId: z.number() }))
        .query(async ({ input }) => {
            try {
                const viewer = await getUserData();
                if (!hasAdminAccess(viewer?.userRole)) {
                    return [];
                }
                return await fetchAnnouncementAudiences(input.hackathonId);
            } catch (err) {
                console.error('Error fetching announcement audiences:', err);
                throw new InternalServerError(
                    'Failed to fetch announcement audiences'
                );
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
