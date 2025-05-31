import { databaseClient } from '@/db/client';
import {
    joinTeamSchema,
    leaveTeamSchema,
    members,
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
    inArray,
    count,
} from 'drizzle-orm';
import {
    BadRequestError,
    InternalServerError,
    ResourceNotFoundError,
} from '../exceptions';
import { publicProcedure, router } from '../trpc';
import { user } from '@/db/schema/users/users';
import { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

import { user as userTable } from '@/db/schema/users/users';

import { getSixDigitId, teamRNGParams } from '@/lib/PRNG/LCG';
import { z } from 'zod';
import { deleteFileFromR2 } from '@/lib/cloudflare/r2';
import { getUserData } from '@/server/routers/usersRouter';
import { auth } from '@/auth/auth';
import slugify from '@/utils/slugify';
import { submissions } from '@/db/schema/submissions';

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
                    firstName: userTable.firstName,
                    lastName: userTable.lastName,
                    email: userTable.email,
                    image: userTable.image,
                    currentStatus: applications.currentStatus,
                })
                .from(membersTable)
                .innerJoin(userTable, eq(userTable.id, membersTable.userId))
                .leftJoin(
                    applications,
                    and(
                        eq(applications.userId, membersTable.userId),
                        eq(applications.hackathonId, input.hackathonId)
                    )
                )
                .where(eq(membersTable.teamId, team.id));

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

            const teamPictureUrl = await databaseClient.transaction(
                async (tx) => {
                    await tx
                        .delete(membersTable)
                        .where(
                            and(
                                eq(membersTable.teamId, input.teamId),
                                eq(membersTable.userId, user.id)
                            )
                        );

                    const members = await tx
                        .select({ teamId: membersTable.teamId })
                        .from(membersTable)
                        .where(eq(membersTable.teamId, input.teamId));

                    if (members.length === 0) {
                        const [team] = await tx
                            .delete(teams)
                            .where(eq(teams.id, input.teamId))
                            .returning();

                        return team?.teamPictureUrl ?? null;
                    }

                    return null;
                }
            );

            if (teamPictureUrl) {
                console.log(
                    `Last member left the team, removing ${teamPictureUrl} from R2`
                );

                await deleteFileFromR2('team-pictures', teamPictureUrl);
            }

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

    /**
     * Get a team by its internal team ID, including its members.
     */
    getTeamById: publicProcedure
        .input(
            z.object({
                teamId: z.number().int(),
            })
        )
        .query(async ({ input }) => {
            const [team] = await databaseClient
                .select({
                    ...getTableColumns(teams),
                })
                .from(teams)
                .where(eq(teams.id, input.teamId))
                .limit(1);

            if (!team) {
                throw new ResourceNotFoundError({
                    id: input.teamId,
                    resourceType: 'team',
                });
            }

            const members = await databaseClient
                .select({
                    userId: membersTable.userId,
                    firstName: userTable.firstName,
                    lastName: userTable.lastName,
                    email: userTable.email,
                    image: userTable.image,
                    currentStatus: applications.currentStatus,
                })
                .from(membersTable)
                .innerJoin(userTable, eq(userTable.id, membersTable.userId))
                .leftJoin(
                    applications,
                    and(
                        eq(applications.userId, membersTable.userId),
                        eq(applications.hackathonId, team.hackathonId)
                    )
                )
                .where(eq(membersTable.teamId, team.id));

            return {
                ...team,
                members,
            };
        }),

    getTeams: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int().optional(),
            })
        )
        .query(async ({ input }) => {
            return getTeamsWithMemberCounts(input.hackathonId ?? -1);
        }),

    getTeamsWithMemberCountWithProject: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int().optional(),
            })
        )
        .query(async ({ input }) => {
            return getTeamsWithCountWithProject(input.hackathonId ?? -1);
        }),

    resolveTeamIdentifier: publicProcedure
        .input(
            z.object({
                identifier: z.string(),
                hackathonId: z.number().int(),
            })
        )
        .query(async ({ input }) => {
            const { identifier, hackathonId } = input;

            // try a slugified name
            const allTeams = await databaseClient
                .select({
                    ...getTableColumns(teams),
                })
                .from(teams)
                .where(eq(teams.hackathonId, hackathonId));

            const matchingTeam = allTeams.find(
                (team) => slugify(team.name) === slugify(identifier)
            );

            if (matchingTeam) {
                return matchingTeam;
            }

            // try display ID
            if (identifier.length === 6) {
                try {
                    const team = await databaseClient
                        .select({
                            ...getTableColumns(teams),
                        })
                        .from(teams)
                        .where(
                            and(
                                eq(teams.displayId, identifier),
                                eq(teams.hackathonId, hackathonId)
                            )
                        )
                        .limit(1);

                    if (team.length > 0) {
                        return team[0];
                    }
                } catch (error) {
                    // continue to next method if display ID fails
                }
            }

            // try as numeric ID
            const numericId = parseInt(identifier);
            if (!isNaN(numericId)) {
                const team = await databaseClient
                    .select({
                        ...getTableColumns(teams),
                    })
                    .from(teams)
                    .where(
                        and(
                            eq(teams.id, numericId),
                            eq(teams.hackathonId, hackathonId)
                        )
                    )
                    .limit(1);

                if (team.length > 0) {
                    return team[0];
                }
            }

            throw new ResourceNotFoundError({
                id: identifier,
                resourceType: 'team',
            });
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

export async function getTeamData(tid: number) {
    const memberIds = await getMemberIds(tid);

    if (!memberIds || memberIds.length === 0) {
        return [];
    }

    const memberEmails = await databaseClient
        .select({ email: user.email })
        .from(user)
        .where(inArray(user.id, memberIds));

    return memberEmails;
}

export async function getMemberIds(tid: number): Promise<number[]> {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return [];
    }

    const dbMembers = await databaseClient
        .select({ userId: members.userId })
        .from(members)
        .where(eq(members.teamId, tid));

    return dbMembers.map((m) => m.userId);
}

export async function getTeamsWithMemberCounts(hackathonId: number) {
    const user = await getUserData();

    if (!user) {
        throw new InternalServerError('User not authenticated');
    }

    let query = databaseClient
        .select({
            id: teams.id,
            teamName: teams.name,
            hackathonId: teams.hackathonId,
            displayId: teams.displayId,
            teamPictureUrl: teams.teamPictureUrl,
            createdBy: teams.createdBy,
            createdAt: teams.createdAt,
            maxMembersCount: teams.maxMembersCount,
        })
        .from(teams);

    if (hackathonId) {
        query = query.where(eq(teams.hackathonId, hackathonId)) as typeof query;
    }

    const allTeams = await query.orderBy(asc(teams.name));

    const teamsWithMemberCount = await Promise.all(
        allTeams.map(async (team) => {
            const members = await databaseClient
                .select({ count: sql<number>`count(*)` })
                .from(membersTable)
                .where(eq(membersTable.teamId, team.id));

            return {
                ...team,
                memberCount: members[0]?.count || 0,
            };
        })
    );

    return teamsWithMemberCount;
}

export async function getTeamsWithCountWithProject(hackathonId: number) {
    const user = await getUserData();

    if (!user) {
        throw new InternalServerError('User not authenticated');
    }

    let countSubQuery = databaseClient
        .selectDistinctOn([members.teamId], {
            teamId: members.teamId,
            members: sql<number>`count(*)`.as('memberCount'),
        })
        .from(members)
        .groupBy(members.teamId)
        .as('subquery');

    let query = await databaseClient
        .select({
            id: teams.id,
            teamName: teams.name,
            hackathonId: teams.hackathonId,
            displayId: teams.displayId,
            teamPictureUrl: teams.teamPictureUrl,
            createdBy: teams.createdBy,
            createdAt: teams.createdAt,
            maxMembersCount: teams.maxMembersCount,
            members: countSubQuery.members,
            submission: submissions.response,
        })
        .from(teams)
        .innerJoin(submissions, eq(teams.id, submissions.teamId))
        .innerJoin(countSubQuery, eq(countSubQuery.teamId, teams.id));

    return query;
}
