import { databaseClient } from '@/db/client';
import { checkIns } from '@/db/schema/checkIn';
import { challengeCompletions, challenges } from '@/db/schema/challenges';
import { events } from '@/db/schema/events';
import { shopPurchases } from '@/db/schema/shop';
import { and, eq, sql } from 'drizzle-orm';

export type PointsBalance = {
    earned: number;
    spent: number;
    balance: number;
};

type ChallengeRow = {
    id: number;
    lowestPoints: number;
    maxCompletions: number;
    eventType: string | null;
};

type CompletionRow = {
    challengeId: number;
    userId: number;
    pointsAwarded: number;
};

type CheckInRow = {
    userId: number;
    eventId: number;
};

/** Check-ins count for event-type challenges; else use completions. */
export function computeEarnedPoints(input: {
    challenges: ChallengeRow[];
    events: { id: number; eventType: string | null }[];
    checkIns: CheckInRow[];
    completions: CompletionRow[];
    userId: number;
}): number {
    const checkedInEventIds = new Set(
        input.checkIns
            .filter((row) => row.userId === input.userId)
            .map((row) => row.eventId)
    );

    const checkInsByEventType = new Map<string, number>();
    for (const event of input.events) {
        if (!event.eventType || !checkedInEventIds.has(event.id)) continue;
        const key = event.eventType.trim().toLowerCase();
        checkInsByEventType.set(key, (checkInsByEventType.get(key) ?? 0) + 1);
    }

    const completionsByChallenge = new Map<
        number,
        { count: number; points: number }
    >();
    for (const row of input.completions) {
        if (row.userId !== input.userId) continue;
        const current = completionsByChallenge.get(row.challengeId) ?? {
            count: 0,
            points: 0,
        };
        current.count += 1;
        current.points += row.pointsAwarded ?? 0;
        completionsByChallenge.set(row.challengeId, current);
    }

    let earned = 0;
    for (const challenge of input.challenges) {
        const eventTypeKey = challenge.eventType?.trim().toLowerCase();
        const completion = completionsByChallenge.get(challenge.id);
        const targetCompletions = Math.max(1, challenge.maxCompletions ?? 1);

        if (eventTypeKey) {
            const checkInCount = checkInsByEventType.get(eventTypeKey) ?? 0;
            const count = Math.min(
                Math.max(
                    checkInCount,
                    (completion?.count ?? 0) > 0 ? targetCompletions : 0
                ),
                targetCompletions
            );
            earned += count * challenge.lowestPoints;
            continue;
        }

        if (!completion || completion.count === 0) continue;
        const counted = Math.min(completion.count, targetCompletions);
        const awarded =
            completion.count <= targetCompletions
                ? completion.points
                : counted * challenge.lowestPoints;
        earned += awarded;
    }

    return earned;
}

async function loadHackathonPointsContext(hackathonId: number) {
    const [eventRows, challengeRows, checkInRows, completionRows] =
        await Promise.all([
            databaseClient
                .select({
                    id: events.id,
                    eventType: events.eventType,
                })
                .from(events)
                .where(eq(events.hackathonId, hackathonId)),
            databaseClient
                .select({
                    id: challenges.id,
                    lowestPoints: challenges.lowestPoints,
                    maxCompletions: challenges.maxCompletions,
                    eventType: challenges.eventType,
                })
                .from(challenges)
                .where(eq(challenges.hackathonId, hackathonId)),
            databaseClient
                .select({
                    userId: checkIns.userId,
                    eventId: checkIns.eventId,
                })
                .from(checkIns)
                .innerJoin(events, eq(events.id, checkIns.eventId))
                .where(eq(events.hackathonId, hackathonId)),
            databaseClient
                .select({
                    challengeId: challengeCompletions.challengeId,
                    userId: challengeCompletions.userId,
                    pointsAwarded: challengeCompletions.pointsAwarded,
                })
                .from(challengeCompletions)
                .innerJoin(
                    challenges,
                    eq(challenges.id, challengeCompletions.challengeId)
                )
                .where(eq(challenges.hackathonId, hackathonId)),
        ]);

    return {
        events: eventRows,
        challenges: challengeRows,
        checkIns: checkInRows,
        completions: completionRows,
    };
}

export async function getEarnedPoints(
    hackathonId: number,
    userId: number
): Promise<number> {
    const context = await loadHackathonPointsContext(hackathonId);
    return computeEarnedPoints({ ...context, userId });
}

export async function getEarnedPointsByUser(
    hackathonId: number,
    userIds: number[]
): Promise<Map<number, number>> {
    const result = new Map<number, number>();
    if (userIds.length === 0) return result;

    const context = await loadHackathonPointsContext(hackathonId);
    const uniqueUserIds = [...new Set(userIds)];
    for (const userId of uniqueUserIds) {
        result.set(userId, computeEarnedPoints({ ...context, userId }));
    }
    return result;
}

export async function getSpentPoints(
    hackathonId: number,
    userId: number
): Promise<number> {
    const [row] = await databaseClient
        .select({
            total: sql<number>`coalesce(sum(${shopPurchases.pointsSpent}), 0)`,
        })
        .from(shopPurchases)
        .where(
            and(
                eq(shopPurchases.hackathonId, hackathonId),
                eq(shopPurchases.userId, userId)
            )
        );

    return Number(row?.total ?? 0);
}

export async function getPointsBalance(
    hackathonId: number,
    userId: number
): Promise<PointsBalance> {
    const [earned, spent] = await Promise.all([
        getEarnedPoints(hackathonId, userId),
        getSpentPoints(hackathonId, userId),
    ]);
    return {
        earned,
        spent,
        balance: earned - spent,
    };
}

export async function countPurchasesForItem(itemId: number): Promise<number> {
    const [row] = await databaseClient
        .select({
            total: sql<number>`coalesce(sum(${shopPurchases.quantity}), 0)`,
        })
        .from(shopPurchases)
        .where(eq(shopPurchases.itemId, itemId));

    return Number(row?.total ?? 0);
}
