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
import { applications } from '@/db/schema/applications';
import {
    eq,
    and,
    getTableColumns,
    asc,
    TablesRelationalConfig,
    sql,
} from 'drizzle-orm';
import {
    BadRequestError,
    InternalServerError,
    ResourceNotFoundError,
} from '../exceptions';
import { publicProcedure, router } from '../trpc';
import { getUserData, user } from '@/db/schema/users/users';
import { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

import { getSixDigitId, teamRNGParams } from '@/lib/PRNG/LCG';
import { z } from 'zod';

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

                // get next index in id sequence
                const [_index] = await tx.execute(
                    sql`select (last_value + 1) as "last_value" from teams_id_seq`
                );
                const index = parseInt(`${_index['last_value']}`, 10);

                // fetch id failed
                if (isNaN(index)) {
                    throw new InternalServerError(
                        `create team failed, fetch index failed: ${index}`
                    );
                }

                const displayId = getSixDigitId(index, teamRNGParams);

                const [team] = await tx
                    .insert(teams)
                    .values({
                        hackathonId: input.hackathonId,
                        name: input.name,
                        teamPictureUrl: input.teamPictureUrl,
                        createdBy: user.id,
                        displayId,
                    })
                    .returning();

                // team creator join their new team
                const members = await tx
                    .insert(membersTable)
                    .values({
                        teamId: team.id,
                        userId: user.id,
                    })
                    .returning();

                return {
                    ...team,
                    members,
                };
            });

            return team;
        }),

    /**
     * Join team via the 6 digit display id of the team.
     * Display id is a string of 6 characters.
     */
    joinTeam: publicProcedure
        .input(joinTeamSchema)
        .mutation(async ({ input }) => {
            const { teamDisplayId: _teamDisplayId } = input;

            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError('Cannot find user data');
            }

            const userId = user?.id;

            const team = await databaseClient.transaction(async (tx) => {
                // get team info
                const [team] = await tx
                    .select({
                        teamId: teams.id,
                        name: teams.name,
                        hackathonId: teams.hackathonId,
                        maxMembersCount: teams.maxMembersCount,
                        displayId: teams.displayId,
                    })
                    .from(teams)
                    .where(eq(teams.displayId, _teamDisplayId));

                if (!team) {
                    throw new ResourceNotFoundError({
                        id: _teamDisplayId,
                        resourceType: 'team',
                    });
                }

                const { hackathonId, maxMembersCount, teamId } = team;

                const members = await tx
                    .select({ count: membersTable.userId })
                    .from(membersTable)
                    .where(eq(membersTable.teamId, teamId))
                    .for('update');

                if (members.length >= maxMembersCount) {
                    throw new BadRequestError(
                        `Team ${_teamDisplayId} already has ${members.length} members`
                    );
                }

                await checkIfUserInExistingTeam(tx, userId, hackathonId);

                await tx.insert(membersTable).values({
                    teamId: teamId,
                    userId: userId,
                });

                return team;
            });

            return team;
        }),

    /**
     * returns the team the current login user belongs to.
     *
     * returns null the user is not in a team yet.
     *
     * return includes team info, team members, and team display id(6 digits)
     */
    getCurrentTeam: publicProcedure
        .input(getCurrentTeamSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError('Cannot find user data');
            }

            const [team] = await databaseClient
                .select({
                    ...getTableColumns(teams),
                })
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
                .orderBy(asc(membersTable.createdAt))
                .limit(1);

            if (!team) {
                return null;
            }

            const members = await databaseClient
                .select({
                    userId: membersTable.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    currentStatus: applications.currentStatus,
                })
                .from(membersTable)
                .innerJoin(user, eq(user.id, membersTable.userId))
                .where(eq(membersTable.teamId, team.id))
                .leftJoin(
                    applications,
                    and(
                        eq(applications.userId, user.id),
                        eq(applications.hackathonId, input.hackathonId)
                    )
                );

            return {
                ...team,
                members,
            };
        }),

    /**
     * Leave the team user is currently in, using the internal team id. (NOT, the 6 digit id.)
     */
    leaveTeam: publicProcedure
        .input(leaveTeamSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new ResourceNotFoundError({
                    id: -1,
                    resourceType: 'user',
                });
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

    getTeamByDisplayId: publicProcedure
        .input(
            z.object({
                teamDisplayId: z.string().length(6),
            })
        )
        .query(async ({ input }) => {
            const [team] = await databaseClient
                .select({
                    ...getTableColumns(teams),
                })
                .from(teams)
                .where(eq(teams.displayId, input.teamDisplayId))
                .limit(1);

            if (!team) {
                // team with this display id is not found
                throw new ResourceNotFoundError({
                    id: input.teamDisplayId,
                    resourceType: 'team',
                });
            }

            const members = await databaseClient
                .select({
                    userId: membersTable.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                })
                .from(membersTable)
                .innerJoin(user, eq(user.id, membersTable.userId))
                .where(eq(membersTable.teamId, team.id));

            return {
                ...team,
                members,
            };
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
