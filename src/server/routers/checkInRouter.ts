import { databaseClient } from '@/db/client';
import {
    checkIns,
    getEventCheckInCountSchema,
    insertCheckInSchema,
    isCheckInSchema,
} from '@/db/schema/checkIn';
import { challengeCompletions, challenges } from '@/db/schema/challenges';
import { user as usersTable } from '@/db/schema/users/users';
import { ResourceNotFoundError } from '../exceptions';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';
import { and, desc, eq, count } from 'drizzle-orm';
import { events } from '@/db/schema/events';
import { applications } from '@/db/schema/applications';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { assignHouseIfNeeded } from '@/server/houses/assignHouse';

export const checkInRouter = router({
    checkIn: adminProcedure
        .input(insertCheckInSchema)
        .mutation(async ({ input }) => {
            const [eventRow] = await databaseClient
                .select({
                    hackathonId: events.hackathonId,
                    points: events.points,
                    variablePoints: events.variablePoints,
                })
                .from(events)
                .where(eq(events.id, input.eventId))
                .limit(1);

            if (!eventRow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find event with id ${input.eventId}`,
                });
            }

            let pointsAwarded: number;
            if (eventRow.variablePoints) {
                if (input.pointsAwarded == null) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            'pointsAwarded is required for variable-point events',
                    });
                }
                if (
                    input.pointsAwarded < 1 ||
                    input.pointsAwarded > eventRow.points
                ) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `pointsAwarded must be between 1 and ${eventRow.points}`,
                    });
                }
                pointsAwarded = input.pointsAwarded;
            } else {
                pointsAwarded = eventRow.points;
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
                    pointsAwarded,
                })
                .onConflictDoNothing({
                    target: [checkIns.userId, checkIns.eventId],
                });

            const linkedChallenges = await databaseClient
                .select({
                    id: challenges.id,
                    points: challenges.points,
                    variablePoints: challenges.variablePoints,
                    maxCompletions: challenges.maxCompletions,
                })
                .from(challenges)
                .where(eq(challenges.eventId, input.eventId));

            for (const challenge of linkedChallenges) {
                if (challenge.variablePoints || challenge.maxCompletions > 1) {
                    continue;
                }
                await databaseClient
                    .insert(challengeCompletions)
                    .values({
                        challengeId: challenge.id,
                        userId: input.userId,
                        pointsAwarded: challenge.points,
                    })
                    .onConflictDoNothing({
                        target: [
                            challengeCompletions.challengeId,
                            challengeCompletions.userId,
                        ],
                    });
            }

            // Fallback assign house if assignment was skipped in RSVP
            try {
                await assignHouseIfNeeded(eventRow.hackathonId, input.userId);
            } catch (error) {
                console.error(
                    'House assignment fallback failed during checkin:',
                    error
                );
            }

            return true;
        }),

    isCheckedIn: adminProcedure
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

    getEventCheckInCounts: adminProcedure
        .input(getEventCheckInCountSchema)
        .query(async ({ input }) => {
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
