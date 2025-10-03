import { databaseClient } from '@/db/client';
import {
    checkIns,
    getEventCheckInCountSchema,
    insertCheckInSchema,
    isCheckInSchema,
} from '@/db/schema/checkIn';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError } from '../exceptions';
import { publicProcedure, router } from '../trpc';
import { and, desc, eq, count } from 'drizzle-orm';
import { getUserData } from '@/server/routers/usersRouter';
import { events } from '@/db/schema/events';

export const checkInRouter = router({
    checkIn: publicProcedure
        .input(insertCheckInSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can check people in
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            await databaseClient
                .insert(checkIns)
                .values({
                    eventId: input.eventId,
                    userId: input.userId,
                })
                .onConflictDoNothing({
                    target: [checkIns.userId, checkIns.eventId],
                });

            return true;
        }),

    isCheckedIn: publicProcedure
        .input(isCheckInSchema)
        .query(async ({ input }) => {
            const checkInRecord = await databaseClient
                .select({ checkInTime: checkIns.checkInTime })
                .from(checkIns)
                .where(
                    and(
                        eq(checkIns.userId, input.userId),
                        eq(checkIns.eventId, input.eventId)
                    )
                )
                .limit(1);

            if (checkInRecord.length === 0) {
                return { isCheckedIn: false, checkInTime: null };
            }

            return {
                isCheckedIn: true,
                checkInTime: checkInRecord[0].checkInTime,
            };
        }),

    getEventCheckInCounts: publicProcedure
        .input(getEventCheckInCountSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            const checkInCounts = await databaseClient
                .select({
                    eventId: events.id,
                    eventTitle: events.title,
                    checkInCount: count(checkIns.userId),
                })
                .from(events)
                .leftJoin(checkIns, eq(events.id, checkIns.eventId))
                .where(
                    and(
                        eq(events.hackathonId, input.hackathonId),
                        eq(events.hasCheckIn, true)
                    )
                )
                .groupBy(events.id, events.title)
                .orderBy(desc(events.startDate));

            return checkInCounts;
        }),
});
