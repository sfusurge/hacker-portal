import { databaseClient } from '@/db/client';
import { checkIns } from '@/db/schema/checkIn';
import { events } from '@/db/schema/events';
import {
    assignHousesSchema,
    createHousesSchema,
    getHouseForUserSchema,
    getHouseStandingsSchema,
    getHousesSchema,
    houseMemberships,
    houses,
} from '@/db/schema/houses';
import { hasAdminAccess } from '@/lib/auth/roles';
import { TRPCError } from '@trpc/server';
import { and, asc, countDistinct, desc, eq, sql, sum } from 'drizzle-orm';
import { assignUnassignedHouses } from '@/server/houses/assignHouse';
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
});
