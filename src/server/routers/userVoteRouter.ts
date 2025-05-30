import { publicProcedure, router } from '../trpc';
import {
    insertUserVoteSchema,
    userVoteTable,
    getHasUserVotedSchema,
    getAllUserVotesSchema,
} from '@/db/schema/userVote';
import { databaseClient } from '@/db/client';
import { eq, and, getTableColumns } from 'drizzle-orm';

export const userVoteRouter = router({
    insertUserVote: publicProcedure
        .input(insertUserVoteSchema)
        .mutation(async ({ input }) => {
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
                    // Update existing vote
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
                throw new Error('Failed to process vote');
            }
        }),

    getHasUserVoted: publicProcedure
        .input(getHasUserVotedSchema)
        .query(async ({ input }) => {
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

                const hasVoted = userVote.length > 0;

                return {
                    hasVoted,
                };
            } catch (error) {
                console.error('Error checking if user has voted:', error);
                throw new Error('Failed to check voting status');
            }
        }),

    getAllUserVotes: publicProcedure
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

                const totalVotes = allVotes.length;

                return {
                    votes: allVotes,
                    votesByTeam,
                    totalVotes,
                    totalParticipants: allVotes.length,
                };
            } catch (error) {
                console.error('Error getting all user votes:', error);
                throw new Error('Failed to retrieve votes');
            }
        }),
});

export type userVoteRouter = typeof userVoteRouter;
