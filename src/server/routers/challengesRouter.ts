import { databaseClient } from '@/db/client';
import {
    challengeCompletions,
    challenges,
    completeChallengeSchema,
    deleteChallengeSchema,
    getChallengesSchema,
    insertChallengeSchema,
    isChallengeCompleteSchema,
    updateChallengeSchema,
} from '@/db/schema/challenges';
import { user as usersTable } from '@/db/schema/users/users';
import { ResourceNotFoundError } from '../exceptions';
import { TRPCError } from '@trpc/server';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import { and, asc, count, eq, getTableColumns } from 'drizzle-orm';
import { events } from '@/db/schema/events';
import { applications } from '@/db/schema/applications';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { assignHouseIfNeeded } from '@/server/houses/assignHouse';

async function assertEventInHackathon(
    eventId: number | null | undefined,
    hackathonId: number
) {
    if (eventId == null) return;

    const [event] = await databaseClient
        .select({
            id: events.id,
            hackathonId: events.hackathonId,
        })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!event) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Cannot find event with id ${eventId}`,
        });
    }

    if (event.hackathonId !== hackathonId) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Linked event must belong to the same hackathon',
        });
    }
}

export const challengesRouter = router({
    getChallenges: protectedProcedure
        .input(getChallengesSchema)
        .query(async ({ input }) => {
            return databaseClient
                .select({
                    ...getTableColumns(challenges),
                    eventTitle: events.title,
                })
                .from(challenges)
                .leftJoin(events, eq(challenges.eventId, events.id))
                .where(eq(challenges.hackathonId, input.hackathonId))
                .orderBy(asc(challenges.title));
        }),

    createChallenge: adminProcedure
        .input(insertChallengeSchema)
        .mutation(async ({ input }) => {
            await assertEventInHackathon(input.eventId, input.hackathonId);

            const [row] = await databaseClient
                .insert(challenges)
                .values({
                    hackathonId: input.hackathonId,
                    eventId: input.eventId ?? null,
                    title: input.title,
                    description: input.description ?? '',
                    longDescription: input.longDescription,
                    color: input.color ?? '#6466F1',
                    points: input.points ?? 5,
                    maxCompletions: input.maxCompletions ?? 1,
                    variablePoints: input.variablePoints ?? false,
                })
                .returning();

            return row;
        }),

    updateChallenge: adminProcedure
        .input(updateChallengeSchema)
        .mutation(async ({ input }) => {
            const { challengeId, ...rest } = input;

            const [existing] = await databaseClient
                .select({ hackathonId: challenges.hackathonId })
                .from(challenges)
                .where(eq(challenges.id, challengeId))
                .limit(1);

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find challenge with id ${challengeId}`,
                });
            }

            if (rest.eventId !== undefined) {
                await assertEventInHackathon(
                    rest.eventId,
                    existing.hackathonId
                );
            }

            const [row] = await databaseClient
                .update(challenges)
                .set(rest)
                .where(eq(challenges.id, challengeId))
                .returning();

            if (!row) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find challenge with id ${challengeId}`,
                });
            }

            return row;
        }),

    deleteChallenge: adminProcedure
        .input(deleteChallengeSchema)
        .mutation(async ({ input }) => {
            const [result] = await databaseClient
                .select({
                    completionCount: count(challengeCompletions.userId),
                })
                .from(challengeCompletions)
                .where(eq(challengeCompletions.challengeId, input.challengeId));

            if ((result?.completionCount ?? 0) > 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message:
                        'Cannot delete a challenge with existing completions.',
                });
            }

            await databaseClient
                .delete(challenges)
                .where(eq(challenges.id, input.challengeId));

            return true;
        }),

    completeChallenge: adminProcedure
        .input(completeChallengeSchema)
        .mutation(async ({ input }) => {
            const [challenge] = await databaseClient
                .select()
                .from(challenges)
                .where(eq(challenges.id, input.challengeId))
                .limit(1);

            if (!challenge) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find challenge with id ${input.challengeId}`,
                });
            }

            const maxCompletions = Math.max(1, challenge.maxCompletions ?? 1);
            let pointsAwarded: number;

            if (challenge.variablePoints) {
                if (input.pointsAwarded == null) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            'pointsAwarded is required for variable-point challenges',
                    });
                }
                if (
                    input.pointsAwarded < 1 ||
                    input.pointsAwarded > challenge.points
                ) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `pointsAwarded must be between 1 and ${challenge.points}`,
                    });
                }
                pointsAwarded = input.pointsAwarded;
            } else if (maxCompletions > 1) {
                if (input.pointsAwarded == null) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            'pointsAwarded is required for multi-completion challenges',
                    });
                }
                const maxTotal = challenge.points * maxCompletions;
                if (
                    input.pointsAwarded < challenge.points ||
                    input.pointsAwarded > maxTotal ||
                    input.pointsAwarded % challenge.points !== 0
                ) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `pointsAwarded must be ${challenge.points} × (1–${maxCompletions}), up to ${maxTotal}`,
                    });
                }
                pointsAwarded = input.pointsAwarded;
            } else {
                pointsAwarded = challenge.points;
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
                            eq(applications.hackathonId, challenge.hackathonId),
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
                .insert(challengeCompletions)
                .values({
                    challengeId: input.challengeId,
                    userId: input.userId,
                    pointsAwarded,
                })
                .onConflictDoNothing({
                    target: [
                        challengeCompletions.challengeId,
                        challengeCompletions.userId,
                    ],
                });

            try {
                await assignHouseIfNeeded(challenge.hackathonId, input.userId);
            } catch (error) {
                console.error(
                    'House assignment fallback failed during challenge completion:',
                    error
                );
            }

            return true;
        }),

    isChallengeComplete: adminProcedure
        .input(isChallengeCompleteSchema)
        .query(async ({ input }) => {
            const [row] = await databaseClient
                .select({
                    completedAt: challengeCompletions.completedAt,
                    pointsAwarded: challengeCompletions.pointsAwarded,
                })
                .from(challengeCompletions)
                .where(
                    and(
                        eq(challengeCompletions.challengeId, input.challengeId),
                        eq(challengeCompletions.userId, input.userId)
                    )
                )
                .limit(1);

            if (!row) {
                return {
                    isComplete: false,
                    completedAt: null,
                    pointsAwarded: null,
                };
            }

            return {
                isComplete: true,
                completedAt: row.completedAt,
                pointsAwarded: row.pointsAwarded,
            };
        }),
});
