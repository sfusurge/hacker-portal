import { adminProcedure, protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { hasAdminAccess } from '@/lib/auth/roles';
import {
    insertUserVoteSchema,
    userVoteTable,
    getHasUserVotedSchema,
    getAllUserVotesSchema,
} from '@/db/schema/userVote';
import { applications } from '@/db/schema/applications';
import { hackathons } from '@/db/schema/hackathons';
import { teams } from '@/db/schema/teams';
import { databaseClient } from '@/db/client';
import { eq, and, getTableColumns } from 'drizzle-orm';

export const userVoteRouter = router({
    insertUserVote: protectedProcedure
        .input(insertUserVoteSchema)
        .mutation(async ({ input, ctx }) => {
            if (input.userId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You can only submit a vote for yourself.',
                });
            }
            const [application] = await databaseClient
                .select({ currentStatus: applications.currentStatus })
                .from(applications)
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        eq(applications.userId, input.userId)
                    )
                )
                .limit(1);
            if (!application || application.currentStatus !== 'Accepted') {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message:
                        'Only accepted participants can vote for the Audience Choice award.',
                });
            }

            const [hackathon] = await databaseClient
                .select({
                    enabled: hackathons.audienceVotingEnabled,
                    opensAt: hackathons.audienceVotingOpen,
                    closesAt: hackathons.audienceVotingCloses,
                })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId))
                .limit(1);
            const now = new Date();
            if (
                !hackathon?.enabled ||
                (hackathon.opensAt && now < hackathon.opensAt) ||
                (hackathon.closesAt && now > hackathon.closesAt)
            ) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Audience voting is not currently open.',
                });
            }

            const [team] = await databaseClient
                .select({ id: teams.id })
                .from(teams)
                .where(
                    and(
                        eq(teams.id, input.vote),
                        eq(teams.hackathonId, input.hackathonId)
                    )
                )
                .limit(1);
            if (!team) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'The selected team is not part of this hackathon.',
                });
            }

            try {
                const existingVote = await databaseClient
                    .select()
                    .from(userVoteTable)
                    .where(
                        and(
                            eq(userVoteTable.hackathonId, input.hackathonId),
                            eq(userVoteTable.userId, input.userId)
                        )
                    )
                    .limit(1);

                if (existingVote.length > 0) {
                    const [updatedVote] = await databaseClient
                        .update(userVoteTable)
                        .set({
                            vote: input.vote,
                            updatedDate: new Date(),
                        })
                        .where(
                            and(
                                eq(
                                    userVoteTable.hackathonId,
                                    input.hackathonId
                                ),
                                eq(userVoteTable.userId, input.userId)
                            )
                        )
                        .returning();

                    return {
                        success: true,
                        data: updatedVote,
                        message: 'Vote updated successfully',
                    };
                } else {
                    const [newVote] = await databaseClient
                        .insert(userVoteTable)
                        .values({
                            hackathonId: input.hackathonId,
                            userId: input.userId,
                            vote: input.vote,
                        })
                        .returning();

                    return {
                        success: true,
                        data: newVote,
                        message: 'Vote created successfully',
                    };
                }
            } catch (error) {
                console.error('Error inserting/updating user vote:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to process vote',
                });
            }
        }),

    getHasUserVoted: protectedProcedure
        .input(getHasUserVotedSchema)
        .query(async ({ input, ctx }) => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                ctx.user.id !== input.userId
            ) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }
            try {
                const userVote = await databaseClient
                    .select()
                    .from(userVoteTable)
                    .where(
                        and(
                            eq(userVoteTable.userId, input.userId),
                            eq(userVoteTable.hackathonId, input.hackathonId)
                        )
                    )
                    .limit(1);

                return {
                    hasVoted: userVote.length > 0,
                };
            } catch (error) {
                console.error('Error checking if user has voted:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to check voting status',
                });
            }
        }),

    getAllUserVotes: adminProcedure
        .input(getAllUserVotesSchema)
        .query(async ({ input }) => {
            try {
                const allVotes = await databaseClient
                    .select(getTableColumns(userVoteTable))
                    .from(userVoteTable)
                    .where(eq(userVoteTable.hackathonId, input.hackathonId));

                const votesByTeam = allVotes.reduce(
                    (acc, vote) => {
                        acc[vote.vote] = (acc[vote.vote] || 0) + 1;
                        return acc;
                    },
                    {} as Record<number, number>
                );

                return {
                    votes: allVotes,
                    votesByTeam,
                    totalVotes: allVotes.length,
                    totalParticipants: allVotes.length,
                };
            } catch (error) {
                console.error('Error getting all user votes:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve votes',
                });
            }
        }),
});

export type userVoteRouter = typeof userVoteRouter;
