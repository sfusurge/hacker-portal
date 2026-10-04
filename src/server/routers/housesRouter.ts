import { databaseClient } from '@/db/client';
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
import { TRPCError } from '@trpc/server';
import { and, asc, eq, notInArray } from 'drizzle-orm';
import {
    assignUnassignedHouses,
    setUserHouse,
} from '@/server/houses/assignHouse';
import { getEarnedPointsByUser } from '@/server/points/balance';
import {
    adminProcedure,
    protectedProcedure,
    publicProcedure,
    router,
} from '../trpc';
import {
    ADMIN_ROLES_EXCLUDED_FROM_STATS,
    hasAdminAccess,
} from '@/lib/auth/roles';

export const housesRouter = router({
    createHouses: adminProcedure
        .input(createHousesSchema)
        .mutation(async ({ input }) => {
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
    addHouse: adminProcedure
        .input(addHouseSchema)
        .mutation(async ({ input }) => {
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

    renameHouse: adminProcedure
        .input(renameHouseSchema)
        .mutation(async ({ input }) => {
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

    deleteHouse: adminProcedure
        .input(deleteHouseSchema)
        .mutation(async ({ input }) => {
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

    getHouseForUser: protectedProcedure
        .input(getHouseForUserSchema)
        .query(async ({ input, ctx }) => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                ctx.user.id !== input.userId
            ) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }
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

    assignUnassignedHouses: adminProcedure
        .input(assignHousesSchema)
        .mutation(async ({ input }) => {
            return assignUnassignedHouses(input.hackathonId);
        }),

    setUserHouse: adminProcedure
        .input(setUserHouseSchema)
        .mutation(async ({ input }) => {
            return setUserHouse(input.hackathonId, input.userId, input.houseId);
        }),

    getHouseStandings: adminProcedure
        .input(getHouseStandingsSchema)
        .query(async ({ input }) => {
            const houseRows = await databaseClient
                .select({
                    houseId: houses.id,
                    name: houses.name,
                })
                .from(houses)
                .where(eq(houses.hackathonId, input.hackathonId))
                .orderBy(asc(houses.name));

            const members = await databaseClient
                .select({
                    houseId: houseMemberships.houseId,
                    userId: houseMemberships.userId,
                    userRole: usersTable.userRole,
                })
                .from(houseMemberships)
                .innerJoin(
                    usersTable,
                    eq(houseMemberships.userId, usersTable.id)
                )
                .where(eq(houseMemberships.hackathonId, input.hackathonId));

            const scoringUserIds = members
                .filter(
                    (member) =>
                        !ADMIN_ROLES_EXCLUDED_FROM_STATS.includes(
                            member.userRole
                        )
                )
                .map((member) => member.userId);

            const pointsByUser = await getEarnedPointsByUser(
                input.hackathonId,
                scoringUserIds
            );

            const pointsByHouse = new Map<number, number>();
            const memberCountByHouse = new Map<number, number>();
            for (const member of members) {
                memberCountByHouse.set(
                    member.houseId,
                    (memberCountByHouse.get(member.houseId) ?? 0) + 1
                );
                if (ADMIN_ROLES_EXCLUDED_FROM_STATS.includes(member.userRole)) {
                    continue;
                }
                pointsByHouse.set(
                    member.houseId,
                    (pointsByHouse.get(member.houseId) ?? 0) +
                        (pointsByUser.get(member.userId) ?? 0)
                );
            }

            return houseRows
                .map((house) => ({
                    houseId: house.houseId,
                    name: house.name,
                    memberCount: memberCountByHouse.get(house.houseId) ?? 0,
                    points: pointsByHouse.get(house.houseId) ?? 0,
                }))
                .sort(
                    (a, b) =>
                        b.points - a.points || a.name.localeCompare(b.name)
                );
        }),

    getHouseTopScorers: adminProcedure
        .input(getHouseTopScorersSchema)
        .query(async ({ input }) => {
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

            const members = await databaseClient
                .select({
                    houseId: houseMemberships.houseId,
                    userId: usersTable.id,
                    firstName: usersTable.firstName,
                    lastName: usersTable.lastName,
                    email: usersTable.email,
                })
                .from(houseMemberships)
                .innerJoin(
                    usersTable,
                    eq(houseMemberships.userId, usersTable.id)
                )
                .where(
                    and(
                        eq(houseMemberships.hackathonId, input.hackathonId),
                        notInArray(
                            usersTable.userRole,
                            ADMIN_ROLES_EXCLUDED_FROM_STATS
                        )
                    )
                );

            const pointsByUser = await getEarnedPointsByUser(
                input.hackathonId,
                members.map((member) => member.userId)
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

            const sortedMembers = [...members].sort((a, b) => {
                const pointsDiff =
                    (pointsByUser.get(b.userId) ?? 0) -
                    (pointsByUser.get(a.userId) ?? 0);
                if (pointsDiff !== 0) return pointsDiff;
                const last = (a.lastName ?? '').localeCompare(b.lastName ?? '');
                if (last !== 0) return last;
                return (a.firstName ?? '').localeCompare(b.firstName ?? '');
            });

            for (const member of sortedMembers) {
                const list = scorersByHouse.get(member.houseId) ?? [];
                if (input.limit == null || list.length < input.limit) {
                    list.push({
                        userId: member.userId,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        email: member.email,
                        points: pointsByUser.get(member.userId) ?? 0,
                    });
                    scorersByHouse.set(member.houseId, list);
                }
            }

            return houseRows.map((house) => ({
                houseId: house.houseId,
                name: house.name,
                topScorers: scorersByHouse.get(house.houseId) ?? [],
            }));
        }),
});
