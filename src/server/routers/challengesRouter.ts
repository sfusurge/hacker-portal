import { databaseClient } from '@/db/client';
import {
    challengeCompletions,
    challengeEvents,
    challenges,
    completeChallengeSchema,
    deleteChallengeSchema,
    getChallengesSchema,
    importChallengesSchema,
    insertChallengeSchema,
    isChallengeCompleteSchema,
    updateChallengeSchema,
} from '@/db/schema/challenges';
import { user as usersTable } from '@/db/schema/users/users';
import { ResourceNotFoundError } from '../exceptions';
import { TRPCError } from '@trpc/server';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import {
    and,
    asc,
    count,
    eq,
    getTableColumns,
    inArray,
    sql,
} from 'drizzle-orm';
import { events } from '@/db/schema/events';
import { applications } from '@/db/schema/applications';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { assignHouseIfNeeded } from '@/server/houses/assignHouse';
import {
    assertEventsInHackathon,
    getLinkedEventProgress,
    replaceChallengeEvents,
} from '@/server/challenges/linkedEvents';

export const challengesRouter = router({
    getChallenges: protectedProcedure
        .input(getChallengesSchema)
        .query(async ({ input }) => {
            const rows = await databaseClient
                .select({
                    ...getTableColumns(challenges),
                })
                .from(challenges)
                .where(eq(challenges.hackathonId, input.hackathonId))
                .orderBy(asc(challenges.title));

            if (rows.length === 0) return [];

            const challengeIds = rows.map((r) => r.id);
            const links = await databaseClient
                .select({
                    challengeId: challengeEvents.challengeId,
                    eventId: challengeEvents.eventId,
                    eventTitle: events.title,
                })
                .from(challengeEvents)
                .innerJoin(events, eq(events.id, challengeEvents.eventId))
                .where(inArray(challengeEvents.challengeId, challengeIds));

            const linksByChallenge = new Map<
                number,
                { eventId: number; eventTitle: string }[]
            >();
            for (const link of links) {
                const list = linksByChallenge.get(link.challengeId) ?? [];
                list.push({
                    eventId: link.eventId,
                    eventTitle: link.eventTitle,
                });
                linksByChallenge.set(link.challengeId, list);
            }

            return rows.map((row) => {
                const eventLinks = linksByChallenge.get(row.id) ?? [];
                return {
                    ...row,
                    eventIds: eventLinks.map((e) => e.eventId),
                    eventTitles: eventLinks.map((e) => e.eventTitle),
                };
            });
        }),

    createChallenge: adminProcedure
        .input(insertChallengeSchema)
        .mutation(async ({ input }) => {
            const eventIds = [...new Set(input.eventIds ?? [])];
            try {
                await assertEventsInHackathon(eventIds, input.hackathonId);
            } catch (err) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message:
                        err instanceof Error ? err.message : 'Invalid events',
                });
            }

            const maxCompletions = input.variablePoints
                ? 1
                : (input.maxCompletions ??
                  (eventIds.length > 0 ? eventIds.length : 1));

            const [row] = await databaseClient
                .insert(challenges)
                .values({
                    hackathonId: input.hackathonId,
                    title: input.title,
                    description: input.description ?? '',
                    longDescription: input.longDescription,
                    color: input.color ?? '#6466F1',
                    points: input.points ?? 5,
                    maxCompletions,
                    variablePoints: input.variablePoints ?? false,
                })
                .returning();

            await replaceChallengeEvents(row.id, eventIds);
            return row;
        }),

    importChallenges: adminProcedure
        .input(importChallengesSchema)
        .mutation(async ({ input }) => {
            // Validate every row's events before writing anything.
            for (const row of input.challenges) {
                const eventIds = [...new Set(row.eventIds ?? [])];
                try {
                    await assertEventsInHackathon(eventIds, input.hackathonId);
                } catch (err) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            err instanceof Error
                                ? err.message
                                : 'Invalid events',
                    });
                }
            }

            const created = await databaseClient.transaction(async (tx) => {
                let insertedCount = 0;
                for (const row of input.challenges) {
                    const eventIds = [...new Set(row.eventIds ?? [])];
                    const maxCompletions = row.variablePoints
                        ? 1
                        : (row.maxCompletions ??
                          (eventIds.length > 0 ? eventIds.length : 1));

                    const [inserted] = await tx
                        .insert(challenges)
                        .values({
                            hackathonId: input.hackathonId,
                            title: row.title,
                            description: row.description ?? '',
                            longDescription: row.longDescription,
                            color: row.color ?? '#6466F1',
                            points: row.points ?? 5,
                            maxCompletions,
                            variablePoints: row.variablePoints ?? false,
                        })
                        .returning();

                    await replaceChallengeEvents(inserted.id, eventIds, tx);
                    insertedCount += 1;
                }
                return insertedCount;
            });

            return { created };
        }),

    updateChallenge: adminProcedure
        .input(updateChallengeSchema)
        .mutation(async ({ input }) => {
            const { challengeId, eventIds: eventIdsInput, ...rest } = input;

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

            if (eventIdsInput !== undefined) {
                const eventIds = [...new Set(eventIdsInput)];
                try {
                    await assertEventsInHackathon(
                        eventIds,
                        existing.hackathonId
                    );
                } catch (err) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            err instanceof Error
                                ? err.message
                                : 'Invalid events',
                    });
                }
                await replaceChallengeEvents(challengeId, eventIds);
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
                .onConflictDoUpdate({
                    target: [
                        challengeCompletions.challengeId,
                        challengeCompletions.userId,
                    ],
                    set: {
                        pointsAwarded: sql`GREATEST(${challengeCompletions.pointsAwarded}, ${pointsAwarded})`,
                        completedAt: sql`now()`,
                    },
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
            const progress = await getLinkedEventProgress(
                input.challengeId,
                input.userId
            );
            const isComplete =
                progress.total > 0 && progress.completed >= progress.total;

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

            return {
                isComplete,
                completedAt: isComplete ? (row?.completedAt ?? null) : null,
                pointsAwarded: row?.pointsAwarded ?? null,
                completed: progress.completed,
                total: progress.total,
            };
        }),
});
