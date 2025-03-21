import { getUserData } from '@/app/(auth)/layout';
import { databaseClient } from '@/db/client';
import {
    joinTeamSchema,
    leaveTeamSchema,
    members as membersTable,
} from '@/db/schema/members';
import {
    createTeamSchema,
    getCurrentTeamSchema,
    teams,
} from '@/db/schema/teams';
import {
    eq,
    and,
    getTableColumns,
    asc,
    TablesRelationalConfig,
} from 'drizzle-orm';
import {
    BadRequestError,
    InternalServerError,
    ResourceNotFoundError,
} from '../exceptions';
import { publicProcedure, router } from '../trpc';
import { users } from '@/db/schema/users';
import { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

export const teamsRouter = router({
    createTeam: publicProcedure
        .input(createTeamSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError('Cannot find user data');
            }

            const team = await databaseClient.transaction(async (tx) => {

                await checkIfUserInExistingTeam(tx, user.id, input.hackathonId);


                const [team] = await tx
                    .insert(teams)
                    .values({
                        hackathonId: input.hackathonId,
                        name: input.name,
                        teamPictureUrl: input.teamPictureUrl,
                        createdBy: user.id,
                    })
                    .returning();

                // team creator join their new team
                await tx.insert(membersTable).values({
                    teamId: team.id,
                    userId: user.id,
                });

                return team;
            });

            return team;
        }),

    joinTeam: publicProcedure
        .input(joinTeamSchema)
        .mutation(async ({ input }) => {
            const { teamId } = input;

            const user = await getUserData();

            const userId = user?.id;

            if (userId == null) {
                throw new InternalServerError('Cannot find user data');
            }

            await databaseClient.transaction(async (tx) => {
                const [team] = await tx
                    .select({
                        hackathonId: teams.hackathonId,
                        maxMembersCount: teams.maxMembersCount,
                    })
                    .from(teams)
                    .where(eq(teams.id, teamId));

                if (team == null) {
                    throw new ResourceNotFoundError({
                        id: teamId,
                        resourceType: 'team',
                    });
                }

                const { hackathonId, maxMembersCount } = team;

                const members = await tx
                    .select({ userId: membersTable.userId })
                    .from(membersTable)
                    .where(eq(membersTable.teamId, teamId))
                    .for('update');

                if (members.length >= maxMembersCount) {
                    throw new BadRequestError(
                        `team ${teamId} already had ${members.length} members`
                    );
                }


                await checkIfUserInExistingTeam(tx, userId, hackathonId);


                await tx.insert(membersTable).values({
                    teamId: teamId,
                    userId: userId,
                });
            });

            return true;
        }),

    getCurrentTeam: publicProcedure
        .input(getCurrentTeamSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError('Cannot find user data');
            }

            const [team] = await databaseClient
                .select(getTableColumns(teams))
                .from(teams)
                .innerJoin(
                    membersTable,
                    and(
                        eq(membersTable.teamId, teams.id),
                        eq(membersTable.userId, user.id)
                    )
                )
                .where(eq(teams.hackathonId, input.hackathonId))
                // Order by joined date
                .orderBy(asc(membersTable.createdAt));

            if (team == null) {
                return null;
            }

            const members = await databaseClient
                .select({
                    userId: membersTable.userId,
                    firstName: users.firstName,
                    lastName: users.lastName,
                })
                .from(membersTable)
                .innerJoin(users, eq(users.id, membersTable.userId))
                .where(eq(membersTable.teamId, team.id));

            return {
                ...team,
                members,
            };
        }),

    leaveTeam: publicProcedure
        .input(leaveTeamSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError('Cannot find user data');
            }

            await databaseClient
                .delete(membersTable)
                .where(
                    and(
                        eq(membersTable.teamId, input.teamId),
                        eq(membersTable.userId, user.id)
                    )
                );

            return true;
        }),
});

async function checkIfUserInExistingTeam<
    T extends PgQueryResultHKT,
    V extends TablesRelationalConfig,
>(
    tx: PgTransaction<T, Record<string, unknown>, V>,
    userId: number,
    hackathonId: number
): Promise<void> {
    const userTeams = await tx
        .select({ teamId: teams.id })
        .from(teams)
        .innerJoin(
            membersTable,
            and(
                eq(membersTable.teamId, teams.id),
                eq(membersTable.userId, userId)
            )
        )
        .where(eq(teams.hackathonId, hackathonId))
        .for('update');

    if (userTeams.length >= 1) {
        const [existingTeam] = userTeams;

        throw new BadRequestError(
            `user ${userId} has already joined another team ${existingTeam.teamId}`
        );
    }
}
