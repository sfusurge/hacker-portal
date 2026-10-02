import { databaseClient } from '@/db/client';
import {
    challengeCompletions,
    challenges,
    completeChallengeSchema,
    deleteChallengeSchema,
    getChallengesSchema,
    importChallengesSchema,
    insertChallengeSchema,
    isChallengeCompleteSchema,
    resolveChallengePointBounds,
    updateChallengeSchema,
} from '@/db/schema/challenges';
import { user as usersTable } from '@/db/schema/users/users';
import { ResourceNotFoundError } from '../exceptions';
import { TRPCError } from '@trpc/server';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import { and, asc, count, eq, getTableColumns, sql } from 'drizzle-orm';
import { applications } from '@/db/schema/applications';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { assignHouseIfNeeded } from '@/server/houses/assignHouse';
import { getChallengeProgress } from '@/server/challenges/linkedEvents';

export const challengesRouter = router({
    getChallenges: protectedProcedure
        .input(getChallengesSchema)
        .query(async ({ input }) => {
            return databaseClient
                .select({
                    ...getTableColumns(challenges),
                })
                .from(challenges)
                .where(eq(challenges.hackathonId, input.hackathonId))
                .orderBy(asc(challenges.title));
        }),

    createChallenge: adminProcedure
        .input(insertChallengeSchema)
        .mutation(async ({ input }) => {
            const maxCompletions = input.variablePoints
                ? 1
                : Math.max(1, input.maxCompletions ?? 1);

            const bounds = resolveChallengePointBounds(input);

            const [row] = await databaseClient
                .insert(challenges)
                .values({
                    hackathonId: input.hackathonId,
                    title: input.title,
                    description: input.description ?? '',
                    longDescription: input.longDescription,
                    color: input.color ?? '#6466F1',
                    lowestPoints: bounds.lowestPoints,
                    highestPoints: bounds.highestPoints,
                    maxCompletions,
                    variablePoints: bounds.variablePoints,
                    eventType: input.eventType ?? null,
                })
                .returning();

            return row;
        }),

    importChallenges: adminProcedure
        .input(importChallengesSchema)
        .mutation(async ({ input }) => {
            const created = await databaseClient.transaction(async (tx) => {
                let insertedCount = 0;
                for (const row of input.challenges) {
                    const maxCompletions = row.variablePoints
                        ? 1
                        : Math.max(1, row.maxCompletions ?? 1);

                    const bounds = resolveChallengePointBounds(row);

                    await tx.insert(challenges).values({
                        hackathonId: input.hackathonId,
                        title: row.title,
                        description: row.description ?? '',
                        longDescription: row.longDescription,
                        color: row.color ?? '#6466F1',
                        lowestPoints: bounds.lowestPoints,
                        highestPoints: bounds.highestPoints,
                        maxCompletions,
                        variablePoints: bounds.variablePoints,
                        eventType: row.eventType ?? null,
                    });

                    insertedCount += 1;
                }
                return insertedCount;
            });

            return { created };
        }),

    updateChallenge: adminProcedure
        .input(updateChallengeSchema)
        .mutation(async ({ input }) => {
            const { challengeId, ...rest } = input;

            const [existing] = await databaseClient
                .select({
                    lowestPoints: challenges.lowestPoints,
                    highestPoints: challenges.highestPoints,
                    variablePoints: challenges.variablePoints,
                })
                .from(challenges)
                .where(eq(challenges.id, challengeId))
                .limit(1);

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Cannot find challenge with id ${challengeId}`,
                });
            }

            const {
                points: legacyPoints,
                lowestPoints,
                highestPoints,
                variablePoints,
                ...updateRest
            } = rest;

            const touchingPoints =
                lowestPoints !== undefined ||
                highestPoints !== undefined ||
                variablePoints !== undefined ||
                legacyPoints !== undefined;

            const pointPatch = touchingPoints
                ? resolveChallengePointBounds({
                      lowestPoints: lowestPoints ?? existing.lowestPoints,
                      highestPoints: highestPoints ?? existing.highestPoints,
                      points: legacyPoints,
                      variablePoints: variablePoints ?? existing.variablePoints,
                  })
                : null;

            const [row] = await databaseClient
                .update(challenges)
                .set({
                    ...updateRest,
                    ...(pointPatch ?? {}),
                })
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

            let pointsAwarded = challenge.lowestPoints;
            if (challenge.variablePoints) {
                if (input.pointsAwarded == null) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            'pointsAwarded is required for variable-point challenges',
                    });
                }
                pointsAwarded = Math.trunc(input.pointsAwarded);
                if (
                    pointsAwarded < challenge.lowestPoints ||
                    pointsAwarded > challenge.highestPoints
                ) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `pointsAwarded must be between ${challenge.lowestPoints} and ${challenge.highestPoints}`,
                    });
                }
            }

            const maxCompletions = Math.max(1, challenge.maxCompletions ?? 1);
            const [completionCountRow] = await databaseClient
                .select({ n: count() })
                .from(challengeCompletions)
                .where(
                    and(
                        eq(challengeCompletions.challengeId, input.challengeId),
                        eq(challengeCompletions.userId, input.userId)
                    )
                );
            const completionCount = Number(completionCountRow?.n ?? 0);

            if (completionCount >= maxCompletions) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: `Already completed: this challenge has reached the maximum number of completions (${maxCompletions})`,
                });
            }

            const now = new Date();
            await databaseClient.insert(challengeCompletions).values({
                challengeId: input.challengeId,
                userId: input.userId,
                pointsAwarded,
                completedAt: now,
            });

            try {
                await assignHouseIfNeeded(challenge.hackathonId, input.userId);
            } catch (error) {
                console.error(
                    'House assignment fallback failed during challenge completion:',
                    error
                );
            }

            return {
                success: true,
                pointsAwarded,
                completedAt: now,
                completionCount: completionCount + 1,
                maxCompletions,
            };
        }),

    isChallengeComplete: adminProcedure
        .input(isChallengeCompleteSchema)
        .query(async ({ input }) => {
            const [challenge] = await databaseClient
                .select({
                    maxCompletions: challenges.maxCompletions,
                })
                .from(challenges)
                .where(eq(challenges.id, input.challengeId))
                .limit(1);

            const maxCompletions = Math.max(1, challenge?.maxCompletions ?? 1);

            const rows = await databaseClient
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
                .orderBy(asc(challengeCompletions.completedAt));

            const completionCount = rows.length;
            const last = rows[rows.length - 1];
            const progress = await getChallengeProgress(
                input.challengeId,
                input.userId
            );
            const isComplete =
                progress.total > 0 && progress.completed >= progress.total;

            return {
                isComplete,
                completedAt: last?.completedAt ?? null,
                pointsAwarded: last?.pointsAwarded ?? null,
                completed: progress.completed,
                total: progress.total,
                completionCount,
                maxCompletions,
            };
        }),

    getChallengeCompletionCounts: adminProcedure
        .input(getChallengesSchema)
        .query(async ({ input }) => {
            const rows = await databaseClient
                .select({
                    challengeId: challenges.id,
                    title: challenges.title,
                    eventType: challenges.eventType,
                    maxCompletions: challenges.maxCompletions,
                    completionCount: count(challengeCompletions.id),
                })
                .from(challenges)
                .leftJoin(
                    challengeCompletions,
                    eq(challengeCompletions.challengeId, challenges.id)
                )
                .where(eq(challenges.hackathonId, input.hackathonId))
                .groupBy(
                    challenges.id,
                    challenges.title,
                    challenges.eventType,
                    challenges.maxCompletions
                )
                .orderBy(asc(challenges.title));

            const [uniqueRow] = await databaseClient
                .select({
                    uniqueHackers: sql<number>`count(distinct ${challengeCompletions.userId})`,
                })
                .from(challengeCompletions)
                .innerJoin(
                    challenges,
                    eq(challenges.id, challengeCompletions.challengeId)
                )
                .where(eq(challenges.hackathonId, input.hackathonId));

            return {
                challenges: rows.map((row) => ({
                    ...row,
                    completionCount: Number(row.completionCount ?? 0),
                })),
                uniqueHackers: Number(uniqueRow?.uniqueHackers ?? 0),
            };
        }),
});
