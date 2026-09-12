import { databaseClient } from '@/db/client';
import { checkIns } from '@/db/schema/checkIn';
import { events } from '@/db/schema/events';
import {
    MAX_HOUSES_PER_HACKATHON,
    assignHousesSchema,
    addHouseSchema,
    deleteHouseSchema,
    renameHouseSchema,
    createHousesSchema,
    getHouseForUserSchema,
    getHouseStandingsSchema,
    getHouseTopScorersSchema,
    getHousesSchema,
    houseMemberships,
    houses,
    setUserHouseSchema,
} from '@/db/schema/houses';
import { user as usersTable } from '@/db/schema/users/users';
import { hasAdminAccess } from '@/lib/auth/roles';
import { TRPCError } from '@trpc/server';
import { and, asc, countDistinct, desc, eq, sql, sum } from 'drizzle-orm';
import {
    assignUnassignedHouses,
    setUserHouse,
} from '@/server/houses/assignHouse';
import { UnauthorizedError } from '../exceptions';
import { publicProcedure, router } from '../trpc';
import { getUserData } from '@/server/routers/usersRouter';

async function requireAdmin() {
    const user = await getUserData();
    if (!hasAdminAccess(user?.userRole)) {
        throw new UnauthorizedError({
            email: user?.email,
            role: user?.userRole,
        });
    }
    return user;
}

export const housesRouter = router({
    createHouses: publicProcedure
        .input(createHousesSchema)
        .mutation(async ({ input }) => {
            await requireAdmin();

            const existing = await databaseClient
                .select({ id: houses.id })
                .from(houses)
                .where(eq(houses.hackathonId, input.hackathonId))
                .limit(1);

            if (existing.length > 0) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Houses already exist for this hackathon',
                });
            }

            const created = await databaseClient
                .insert(houses)
                .values(
                    input.names.map((name) => ({
                        hackathonId: input.hackathonId,
                        name,
                    }))
                )
                .returning();

            if (created.length !== input.names.length) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: `Expected ${input.names.length} houses, created ${created.length}`,
                });
            }

            return created;
        }),
    addHouse: publicProcedure
        .input(addHouseSchema)
        .mutation(async ({ input }) => {
            await requireAdmin();

            const existing = await databaseClient
                .select({ id: houses.id })
                .from(houses)
                .where(eq(houses.hackathonId, input.hackathonId));

            if (existing.length >= MAX_HOUSES_PER_HACKATHON) {
                throw new TRPCError({
                    code: 'PRECONDITION_FAILED',
                    message: `A hackathon can have at most ${MAX_HOUSES_PER_HACKATHON} houses`,
                });
            }

            const [house] = await databaseClient
                .insert(houses)
                .values({
                    hackathonId: input.hackathonId,
                    name: input.name,
                })
                .returning();

            return house;
        }),

    renameHouse: publicProcedure
        .input(renameHouseSchema)
        .mutation(async ({ input }) => {
            await requireAdmin();

            const [house] = await databaseClient
                .update(houses)
                .set({ name: input.name })
                .where(eq(houses.id, input.houseId))
                .returning();

            if (!house) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'House not found',
                });
            }

            return house;
        }),

    deleteHouse: publicProcedure
        .input(deleteHouseSchema)
        .mutation(async ({ input }) => {
            await requireAdmin();

            return await databaseClient
                .delete(houses)
                .where(eq(houses.id, input.houseId));
        }),

    getHouses: publicProcedure
        .input(getHousesSchema)
        .query(async ({ input }) => {
            return databaseClient
                .select({
                    id: houses.id,
                    name: houses.name,
                    hackathonId: houses.hackathonId,
                    createdAt: houses.createdAt,
                })
                .from(houses)
                .where(eq(houses.hackathonId, input.hackathonId))
                .orderBy(asc(houses.name));
        }),

    getHouseForUser: publicProcedure
        .input(getHouseForUserSchema)
        .query(async ({ input }) => {
            const [row] = await databaseClient
                .select({
                    houseId: houses.id,
                    name: houses.name,
                })
                .from(houseMemberships)
                .innerJoin(houses, eq(houseMemberships.houseId, houses.id))
                .where(
                    and(
                        eq(houseMemberships.hackathonId, input.hackathonId),
                        eq(houseMemberships.userId, input.userId)
                    )
                )
                .limit(1);

            return row ?? null;
        }),

    assignUnassignedHouses: publicProcedure
        .input(assignHousesSchema)
        .mutation(async ({ input }) => {
            await requireAdmin();
            return assignUnassignedHouses(input.hackathonId);
        }),

    setUserHouse: publicProcedure
        .input(setUserHouseSchema)
        .mutation(async ({ input }) => {
            await requireAdmin();
            return setUserHouse(input.hackathonId, input.userId, input.houseId);
        }),

    getHouseStandings: publicProcedure
        .input(getHouseStandingsSchema)
        .query(async ({ input }) => {
            await requireAdmin();

            const rows = await databaseClient
                .select({
                    houseId: houses.id,
                    name: houses.name,
                    memberCount: countDistinct(houseMemberships.userId),
                    points: sql<number>`coalesce(${sum(events.points)}, 0)`,
                })
                .from(houses)
                .leftJoin(
                    houseMemberships,
                    eq(houses.id, houseMemberships.houseId)
                )
                .leftJoin(
                    checkIns,
                    eq(houseMemberships.userId, checkIns.userId)
                )
                .leftJoin(
                    events,
                    and(
                        eq(checkIns.eventId, events.id),
                        eq(events.hackathonId, houses.hackathonId)
                    )
                )
                .where(eq(houses.hackathonId, input.hackathonId))
                .groupBy(houses.id, houses.name)
                .orderBy(
                    desc(sql`coalesce(sum(${events.points}), 0)`),
                    asc(houses.name)
                );

            return rows.map((row) => ({
                houseId: row.houseId,
                name: row.name,
                memberCount: Number(row.memberCount),
                points: Number(row.points),
            }));
        }),

    getHouseTopScorers: publicProcedure
        .input(getHouseTopScorersSchema)
        .query(async ({ input }) => {
            await requireAdmin();

            const houseRows = await databaseClient
                .select({
                    houseId: houses.id,
                    name: houses.name,
                })
                .from(houses)
                .where(eq(houses.hackathonId, input.hackathonId))
                .orderBy(asc(houses.name));

            if (houseRows.length === 0) {
                return [];
            }

            const memberScores = await databaseClient
                .select({
                    houseId: houseMemberships.houseId,
                    userId: usersTable.id,
                    firstName: usersTable.firstName,
                    lastName: usersTable.lastName,
                    email: usersTable.email,
                    points: sql<number>`coalesce(${sum(events.points)}, 0)`,
                })
                .from(houseMemberships)
                .innerJoin(houses, eq(houseMemberships.houseId, houses.id))
                .innerJoin(
                    usersTable,
                    eq(houseMemberships.userId, usersTable.id)
                )
                .leftJoin(
                    checkIns,
                    eq(houseMemberships.userId, checkIns.userId)
                )
                .leftJoin(
                    events,
                    and(
                        eq(checkIns.eventId, events.id),
                        eq(events.hackathonId, houses.hackathonId)
                    )
                )
                .where(eq(houseMemberships.hackathonId, input.hackathonId))
                .groupBy(
                    houseMemberships.houseId,
                    usersTable.id,
                    usersTable.firstName,
                    usersTable.lastName,
                    usersTable.email
                )
                .orderBy(
                    asc(houseMemberships.houseId),
                    desc(sql`coalesce(sum(${events.points}), 0)`),
                    asc(usersTable.lastName),
                    asc(usersTable.firstName)
                );

            const scorersByHouse = new Map<
                number,
                {
                    userId: number;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                    points: number;
                }[]
            >();

            for (const row of memberScores) {
                const list = scorersByHouse.get(row.houseId) ?? [];
                if (input.limit == null || list.length < input.limit) {
                    list.push({
                        userId: row.userId,
                        firstName: row.firstName,
                        lastName: row.lastName,
                        email: row.email,
                        points: Number(row.points),
                    });
                    scorersByHouse.set(row.houseId, list);
                }
            }

            return houseRows.map((house) => ({
                houseId: house.houseId,
                name: house.name,
                topScorers: scorersByHouse.get(house.houseId) ?? [],
            }));
        }),
});
