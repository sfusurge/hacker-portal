import { databaseClient } from '@/db/client';
import { checkIns } from '@/db/schema/checkIn';
import { challengeCompletions, challenges } from '@/db/schema/challenges';
import { events } from '@/db/schema/events';
import { and, count, eq, sql } from 'drizzle-orm';

/**
 * Progress for a challenge:
 * - With eventType: tallies check-ins to events of that type in the hackathon
 * - Without: uses the completion row only (manual award)
 */
export async function getChallengeProgress(
    challengeId: number,
    userId: number
): Promise<{ completed: number; total: number; points: number }> {
    const [challenge] = await databaseClient
        .select({
            hackathonId: challenges.hackathonId,
            highestPoints: challenges.highestPoints,
            maxCompletions: challenges.maxCompletions,
            variablePoints: challenges.variablePoints,
            eventType: challenges.eventType,
        })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (!challenge) {
        return { completed: 0, total: 0, points: 0 };
    }

    const unitPoints = challenge.highestPoints;
    const maxCompletions = Math.max(1, challenge.maxCompletions ?? 1);

    if (challenge.eventType == null) {
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
 * After a check-in, refresh completions for challenges that tally this event's type.
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
            highestPoints: challenges.highestPoints,
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
