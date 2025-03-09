import { getUserData } from '@/app/(auth)/layout';
import { databaseClient } from '@/db/client';
import { joinTeamSchema, members } from '@/db/schema/members';
import { createTeamSchema, teams } from '@/db/schema/teams';
import { eq, sql, and } from 'drizzle-orm';
import { InternalServerError, ResourceNotFoundError } from '../exceptions';
import { publicProcedure, router } from '../trpc';

export const teamsRouter = router({
    createTeam: publicProcedure
        .input(createTeamSchema)
        .mutation(async ({ input }) => {
            const [team] = await databaseClient
                .insert(teams)
                .values({
                    hackathonId: input.hackathonId,
                    name: input.name,
                    teamPictureUrl: input.teamPictureUrl,
                })
                .returning();

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
                    .from(members)
                    .where(eq(members.teamId, teamId))
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
                            members,
                            and(
                                eq(members.teamId, teams.id),
                                eq(members.userId, userId)
                            )
                        )
                        .where(eq(teams.hackathonId, hackathonId!))
                );

            await databaseClient
                .with(memberCountQuery, userTeamCountQuery)
                .insert(members)
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
});
