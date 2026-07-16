import { databaseClient } from '@/db/client';
import { applications } from '@/db/schema/applications';
import {
    HOUSES_PER_HACKATHON,
    houseMemberships,
    houses,
} from '@/db/schema/houses';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { and, count, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export type HouseAssignment = {
    houseId: number;
    name: string;
};

function shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function getMembership(
    hackathonId: number,
    userId: number
): Promise<HouseAssignment | null> {
    const [row] = await databaseClient
        .select({
            houseId: houses.id,
            name: houses.name,
        })
        .from(houseMemberships)
        .innerJoin(houses, eq(houseMemberships.houseId, houses.id))
        .where(
            and(
                eq(houseMemberships.hackathonId, hackathonId),
                eq(houseMemberships.userId, userId)
            )
        )
        .limit(1);

    return row ?? null;
}

/**
 * Assign a hacker to a random least-populated house if they don't have one yet.
 * Returns null if houses have not been created yet for this hackathon.
 */
export async function assignHouseIfNeeded(
    hackathonId: number,
    userId: number
): Promise<HouseAssignment | null> {
    const existing = await getMembership(hackathonId, userId);
    if (existing) {
        return existing;
    }

    const houseRows = await databaseClient
        .select({ id: houses.id, name: houses.name })
        .from(houses)
        .where(eq(houses.hackathonId, hackathonId));

    if (houseRows.length === 0) {
        return null;
    }

    const memberCounts = await databaseClient
        .select({
            houseId: houseMemberships.houseId,
            memberCount: count(),
        })
        .from(houseMemberships)
        .where(eq(houseMemberships.hackathonId, hackathonId))
        .groupBy(houseMemberships.houseId);

    const countByHouse = new Map(
        memberCounts.map((row) => [row.houseId, Number(row.memberCount)])
    );

    const housesWithCounts = houseRows.map((house) => ({
        ...house,
        memberCount: countByHouse.get(house.id) ?? 0,
    }));

    const minCount = Math.min(
        ...housesWithCounts.map((house) => house.memberCount)
    );
    const candidates = housesWithCounts.filter(
        (house) => house.memberCount === minCount
    );
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    await databaseClient
        .insert(houseMemberships)
        .values({
            hackathonId,
            houseId: chosen.id,
            userId,
        })
        .onConflictDoNothing({
            target: [houseMemberships.hackathonId, houseMemberships.userId],
        });

    // Re-read in case of a concurrent assign winning the unique constraint
    const membership = await getMembership(hackathonId, userId);
    return membership ?? { houseId: chosen.id, name: chosen.name };
}

// Backfill: assign every Accepted hacker who still has no house
export async function assignUnassignedHouses(
    hackathonId: number
): Promise<{ assigned: number }> {
    const houseRows = await databaseClient
        .select({ id: houses.id })
        .from(houses)
        .where(eq(houses.hackathonId, hackathonId));

    if (houseRows.length !== HOUSES_PER_HACKATHON) {
        throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Need exactly ${HOUSES_PER_HACKATHON} houses before assigning`,
        });
    }

    const applicants = await databaseClient
        .select({
            userId: applications.userId,
            currentStatus: applications.currentStatus,
        })
        .from(applications)
        .where(eq(applications.hackathonId, hackathonId));

    const eligibleUserIds = applicants
        .filter((a) => isEligibleForHackathonTicketQr(a.currentStatus))
        .map((a) => a.userId);

    const existingMemberships = await databaseClient
        .select({ userId: houseMemberships.userId })
        .from(houseMemberships)
        .where(eq(houseMemberships.hackathonId, hackathonId));

    const alreadyAssigned = new Set(
        existingMemberships.map((row) => row.userId)
    );

    const unassigned = shuffle(
        eligibleUserIds.filter((userId) => !alreadyAssigned.has(userId))
    );

    let assigned = 0;
    for (const userId of unassigned) {
        const result = await assignHouseIfNeeded(hackathonId, userId);
        if (result) {
            assigned += 1;
        }
    }

    return { assigned };
}
