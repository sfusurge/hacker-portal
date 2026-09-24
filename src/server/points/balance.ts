import { databaseClient } from '@/db/client';
import { challengeCompletions, challenges } from '@/db/schema/challenges';
import { shopPurchases } from '@/db/schema/shop';
import { and, eq, sql } from 'drizzle-orm';

export type PointsBalance = {
    earned: number;
    spent: number;
    balance: number;
};

/** Lifetime earned from challenges. Used for leaderboard. */
export async function getEarnedPoints(
    hackathonId: number,
    userId: number
): Promise<number> {
    const [challengeRow] = await databaseClient
        .select({
            total: sql<number>`coalesce(sum(${challengeCompletions.pointsAwarded}), 0)`,
        })
        .from(challengeCompletions)
        .innerJoin(
            challenges,
            eq(challenges.id, challengeCompletions.challengeId)
        )
        .where(
            and(
                eq(challenges.hackathonId, hackathonId),
                eq(challengeCompletions.userId, userId)
            )
        );

    return Number(challengeRow?.total ?? 0);
}

/** Points spent via shop redemptions. */
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
