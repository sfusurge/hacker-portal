import { databaseClient } from '@/db/client';
import { checkIns } from '@/db/schema/checkIn';
import { challengeCompletions, challenges } from '@/db/schema/challenges';
import { events } from '@/db/schema/events';
import { and, count, eq } from 'drizzle-orm';

/**
 * Progress for a challenge:
 * - With eventType: tallies check-ins to events of that type in the hackathon
 * - Without: counts completion rows (one row per award, matching HackerNFC)
 */
export async function getChallengeProgress(
    challengeId: number,
    userId: number
): Promise<{ completed: number; total: number; points: number }> {
    const [challenge] = await databaseClient
        .select({
            hackathonId: challenges.hackathonId,
            lowestPoints: challenges.lowestPoints,
            maxCompletions: challenges.maxCompletions,
            eventType: challenges.eventType,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        return { completed: 0, total: 0, points: 0 };
    }

    const unitPoints = challenge.lowestPoints;
    const maxCompletions = Math.max(1, challenge.maxCompletions ?? 1);

    if (challenge.eventType == null) {
        const [row] = await databaseClient
            .select({ n: count() })
            .from(challengeCompletions)
            .where(
                and(
                    eq(challengeCompletions.challengeId, challengeId),
                    eq(challengeCompletions.userId, userId)
                )
            );

        return {
            completed: Math.min(maxCompletions, Number(row?.n ?? 0)),
            total: maxCompletions,
            points: unitPoints,
        };
    }

    const eventType = challenge.eventType;

    const [eventCountRow] = await databaseClient
        .select({ n: count() })
        .from(events)
        .where(
            and(
                eq(events.hackathonId, challenge.hackathonId),
                eq(events.eventType, eventType)
            )
        );

    const typeCount = Number(eventCountRow?.n ?? 0);
    const total = Math.min(maxCompletions, Math.max(typeCount, 1));

    const [checkInCount] = await databaseClient
        .select({ n: count() })
        .from(checkIns)
        .innerJoin(events, eq(events.id, checkIns.eventId))
        .where(
            and(
                eq(checkIns.userId, userId),
                eq(events.hackathonId, challenge.hackathonId),
                eq(events.eventType, eventType)
            )
        );

    const completed = Math.min(total, Number(checkInCount?.n ?? 0));
    return { completed, total, points: unitPoints };
}

/**
 * After a check-in, insert one completion row per progress step still missing.
 */
export async function syncChallengesForEventCheckIn(
    eventId: number,
    userId: number
) {
    const [eventRow] = await databaseClient
        .select({
            hackathonId: events.hackathonId,
            eventType: events.eventType,
        })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!eventRow) return;

    const matching = await databaseClient
        .select({
            challengeId: challenges.id,
            lowestPoints: challenges.lowestPoints,
            variablePoints: challenges.variablePoints,
        })
        .from(challenges)
        .where(
            and(
                eq(challenges.hackathonId, eventRow.hackathonId),
                eq(challenges.eventType, eventRow.eventType)
            )
        );

    for (const challenge of matching) {
        if (challenge.variablePoints) continue;

        const progress = await getChallengeProgress(
            challenge.challengeId,
            userId
        );
        if (progress.completed < 1) continue;

        const [existingRow] = await databaseClient
            .select({ n: count() })
            .from(challengeCompletions)
            .where(
                and(
                    eq(challengeCompletions.challengeId, challenge.challengeId),
                    eq(challengeCompletions.userId, userId)
                )
            );
        const existingCount = Number(existingRow?.n ?? 0);
        const toAdd = progress.completed - existingCount;
        if (toAdd <= 0) continue;

        const pointsAwarded = challenge.lowestPoints;
        await databaseClient.insert(challengeCompletions).values(
            Array.from({ length: toAdd }, () => ({
                challengeId: challenge.challengeId,
                userId,
                pointsAwarded,
            }))
        );
    }
}
