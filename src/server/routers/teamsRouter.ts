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
import { eq, sql, and, getTableColumns } from 'drizzle-orm';
import { InternalServerError, ResourceNotFoundError } from '../exceptions';
import { publicProcedure, router } from '../trpc';
import { users } from '@/db/schema/users';

export const teamsRouter = router({
    createTeam: publicProcedure
        .input(createTeamSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError(`Can't find user data`);
            }

            const team = await databaseClient.transaction(async (tx) => {
                const [team] = await tx
                    .insert(teams)
                    .values({
                        hackathonId: input.hackathonId,
                        name: input.name,
                        teamPictureUrl: input.teamPictureUrl,
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
                throw new InternalServerError(`Can't find user data`);
            }

            const [team] = await databaseClient
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

            const memberCountQuery = databaseClient.$with('member_count').as(
                databaseClient
                    .select({
                        memberCount: sql<number>`count(*)`.as('member_count'),
                    })
                    .from(membersTable)
                    .where(eq(membersTable.teamId, teamId))
            );

            const userTeamCountQuery = databaseClient
                .$with('user_team_count')
                .as(
                    databaseClient
                        .select({
                            teamCount: sql<number>`count(*)`.as('team_count'),
                        })
                        .from(teams)
                        .innerJoin(
                            membersTable,
                            and(
                                eq(membersTable.teamId, teams.id),
                                eq(membersTable.userId, userId)
                            )
                        )
                        .where(eq(teams.hackathonId, hackathonId!))
                );

            await databaseClient
                .with(memberCountQuery, userTeamCountQuery)
                .insert(membersTable)
                .select(
                    databaseClient
                        .select({
                            teamId: sql<string>`${teamId}`.as('team_id'),
                            userId: sql<string>`${userId}`.as('user_id'),
                        })
                        .from(teams)
                        .where(
                            and(
                                // Team hasn't reached max member size
                                sql`((select ${memberCountQuery.memberCount} from ${memberCountQuery}) < ${maxMembersCount})`,
                                // User hasn't joined any other team
                                sql`((select ${userTeamCountQuery.teamCount} from ${userTeamCountQuery}) = 0)`
                            )
                        )
                );
        }),

    getCurrentTeam: publicProcedure
        .input(getCurrentTeamSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (user == null) {
                throw new InternalServerError('');
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
                .where(eq(teams.hackathonId, input.hackathonId));

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
                throw new InternalServerError(`Can't find user data`);
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
