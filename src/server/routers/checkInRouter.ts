import { databaseClient } from '@/db/client';
import {
    checkIns,
    getEventCheckInCountSchema,
    insertCheckInSchema,
    isCheckInSchema,
} from '@/db/schema/checkIn';
import { user as usersTable } from '@/db/schema/users/users';
import { ResourceNotFoundError, UnauthorizedError } from '../exceptions';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import { and, desc, eq, count } from 'drizzle-orm';
import { getUserData } from '@/server/routers/usersRouter';
import { events } from '@/db/schema/events';
import { applications } from '@/db/schema/applications';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { hasAdminAccess } from '@/lib/auth/roles';

export const checkInRouter = router({
    checkIn: publicProcedure
        .input(insertCheckInSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can check people in
            if (!hasAdminAccess(user?.userRole)) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            const [eventRow] = await databaseClient
                .select({ hackathonId: events.hackathonId })
                .from(events)
                .where(eq(events.id, input.eventId))
                .limit(1);

            if (!eventRow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find event with id ${input.eventId}`,
                });
            }

            const [[targetUser], [application]] = await Promise.all([
                databaseClient
                    .select({ id: usersTable.id })
                    .from(usersTable)
                    .where(eq(usersTable.id, input.userId))
                    .limit(1),
                databaseClient
                    .select({ currentStatus: applications.currentStatus })
                    .from(applications)
                    .where(
                        and(
                            eq(applications.hackathonId, eventRow.hackathonId),
                            eq(applications.userId, input.userId)
                        )
                    )
                    .limit(1),
            ]);

            if (!targetUser) {
                throw new ResourceNotFoundError({
                    id: input.userId,
                    resourceType: 'user',
                });
            }

            if (!isEligibleForHackathonTicketQr(application?.currentStatus)) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'USER NOT ACCEPTED',
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

            if (!hasAdminAccess(user?.userRole)) {
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
