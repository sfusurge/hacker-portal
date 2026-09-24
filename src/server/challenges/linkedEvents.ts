import { databaseClient } from '@/db/client';
import { checkIns } from '@/db/schema/checkIn';
import {
    challengeCompletions,
    challengeEvents,
    challenges,
} from '@/db/schema/challenges';
import { and, count, eq, inArray, sql } from 'drizzle-orm';

async function getChallengeLinkedEventIds(
    challengeId: number
): Promise<number[]> {
    const linked = await databaseClient
        .select({ eventId: challengeEvents.eventId })
        .from(challengeEvents)
        .where(eq(challengeEvents.challengeId, challengeId));

    return linked.map((r) => r.eventId);
}

/**
 * Count how many linked events a user has checked into for a challenge,
 * capped by maxCompletions (and by linked event count).
 */
export async function getLinkedEventProgress(
    challengeId: number,
    userId: number
): Promise<{ completed: number; total: number; points: number }> {
    const [challenge] = await databaseClient
        .select({
            highestPoints: challenges.highestPoints,
            maxCompletions: challenges.maxCompletions,
            variablePoints: challenges.variablePoints,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        return { completed: 0, total: 0, points: 0 };
    }

    const unitPoints = challenge.highestPoints;
    const linkedIds = await getChallengeLinkedEventIds(challengeId);
    const maxCompletions = Math.max(1, challenge.maxCompletions ?? 1);

    if (linkedIds.length === 0) {
        // Manual challenge (no events): progress from completion row only.
        const [row] = await databaseClient
            .select({
                pointsAwarded: challengeCompletions.pointsAwarded,
            })
            .from(challengeCompletions)
            .where(
                and(
                    eq(challengeCompletions.challengeId, challengeId),
                    eq(challengeCompletions.userId, userId)
                )
            )
            .limit(1);

        if (!row) {
            return {
                completed: 0,
                total: maxCompletions,
                points: unitPoints,
            };
        }

        const completed =
            challenge.variablePoints || unitPoints < 1
                ? 1
                : Math.min(
                      maxCompletions,
                      Math.max(1, Math.floor(row.pointsAwarded / unitPoints))
                  );
        return {
            completed,
            total: maxCompletions,
            points: unitPoints,
        };
    }

    const total = Math.min(maxCompletions, linkedIds.length);

    const [checkInCount] = await databaseClient
        .select({ n: count() })
        .from(checkIns)
        .where(
            and(
                eq(checkIns.userId, userId),
                inArray(checkIns.eventId, linkedIds)
            )
        );

    const completed = Math.min(total, Number(checkInCount?.n ?? 0));
    return { completed, total, points: unitPoints };
}

/**
 * After a check-in, refresh challenge_completions for every challenge linked
 * to that event. Progress = # of linked events checked into (capped).
 * Points awarded = highestPoints × completed (skipped for variable-points).
 */
export async function syncChallengesForEventCheckIn(
    eventId: number,
    userId: number
) {
    const linked = await databaseClient
        .select({
            challengeId: challengeEvents.challengeId,
            highestPoints: challenges.highestPoints,
            variablePoints: challenges.variablePoints,
        })
        .from(challengeEvents)
        .innerJoin(challenges, eq(challenges.id, challengeEvents.challengeId))
        .where(eq(challengeEvents.eventId, eventId));

    for (const challenge of linked) {
        if (challenge.variablePoints) continue;

        const progress = await getLinkedEventProgress(
            challenge.challengeId,
            userId
        );
        if (progress.completed < 1) continue;

        const pointsAwarded = challenge.highestPoints * progress.completed;

        await databaseClient
            .insert(challengeCompletions)
            .values({
                challengeId: challenge.challengeId,
                userId,
                pointsAwarded,
            })
            .onConflictDoUpdate({
                target: [
                    challengeCompletions.challengeId,
                    challengeCompletions.userId,
                ],
                set: {
                    pointsAwarded: sql`GREATEST(${challengeCompletions.pointsAwarded}, ${pointsAwarded})`,
                },
            });
    }
}

export async function replaceChallengeEvents(
    challengeId: number,
    eventIds: number[],
    db: {
        delete: typeof databaseClient.delete;
        insert: typeof databaseClient.insert;
    } = databaseClient
) {
    const unique = [...new Set(eventIds)];
    await db
        .delete(challengeEvents)
        .where(eq(challengeEvents.challengeId, challengeId));

    if (unique.length === 0) return;

    await db.insert(challengeEvents).values(
        unique.map((eventId) => ({
            challengeId,
            eventId,
        }))
    );
}

export async function assertEventsInHackathon(
    eventIds: number[],
    hackathonId: number
) {
    if (eventIds.length === 0) return;

    const { events } = await import('@/db/schema/events');
    const rows = await databaseClient
        .select({ id: events.id, hackathonId: events.hackathonId })
        .from(events)
        .where(inArray(events.id, eventIds));

    if (rows.length !== new Set(eventIds).size) {
        throw new Error('One or more linked events were not found');
    }
    for (const row of rows) {
        if (row.hackathonId !== hackathonId) {
            throw new Error('Linked events must belong to the same hackathon');
        }
    }
}
