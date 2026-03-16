import { databaseClient } from '@/db/client';
import { hackathons } from '@/db/schema/hackathons';
import { members } from '@/db/schema/members';
import {
    getHasSubmissionSchema,
    getSubmissionQuestionsSchema,
    insertSubmissionSchema,
    submissions,
    submissionStatusEnum,
    SubmissionStatusEnumType,
} from '@/db/schema/submissions';
import { teams } from '@/db/schema/teams';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { getUserData } from './usersRouter';

export interface SubmitSubmissionResponse {
    userId: number;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: SubmissionStatusEnumType;
}

export interface SubmissionWithTeamInfo {
    id: number;
    hackathonId: number;
    teamId: number;
    response: Record<string, unknown>;
    createdDate: number; // Unix timestamp
    currentStatus: typeof submissionStatusEnum;
    pendingStatus: typeof submissionStatusEnum | null;
    teamName: string | null;
}

export const submissionsRouter = router({
    getUserTeamSubmission: publicProcedure
        .input(z.object({}))
        .query(async ({ input }) => {
            const userInfo = await getUserData();
            const [submission] = await databaseClient
                .select(getTableColumns(submissions))
                .from(submissions)
                .innerJoin(members, eq(members.teamId, submissions.teamId))
                .where(eq(members.userId, userInfo?.id ?? -1))
                .limit(1);

            return submission ?? null;
        }),
    getSubmissionQuestions: publicProcedure
        .input(getSubmissionQuestionsSchema)
        .query(async ({ input }) => {
            const applicationsWithTeamInfo = await databaseClient
                .select({ submissionQuestions: hackathons.submissionQuestions })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId));

            return applicationsWithTeamInfo[0]?.submissionQuestions || null;
        }),

    submitSubmission: publicProcedure
        .input(insertSubmissionSchema)
        .mutation(async ({ input }): Promise<SubmitSubmissionResponse> => {
            const [team] = await databaseClient
                .select({ hackathonId: teams.hackathonId })
                .from(teams)
                .where(eq(teams.id, input.teamId))
                .limit(1);
            if (!team || team.hackathonId !== input.hackathonId) {
                throw new Error('Team does not belong to this hackathon');
            }

            const [submission] = await databaseClient
                .insert(submissions)
                .values({
                    teamId: input.teamId,
                    hackathonId: input.hackathonId,
                    response: input.response,
                })
                .onConflictDoNothing({
                    target: [submissions.teamId],
                })
                .returning();

            return {
                userId: 0, // Optional: change if you track the user
                response: submission.response as Record<string, unknown>,
                createdDate: submission.createdDate,
                currentStatus: submission.currentStatus,
            };
        }),

    getHasSubmissions: publicProcedure
        .input(getHasSubmissionSchema)
        .query(async ({ input }) => {
            const { userId } = input;

            // Step 1: Find the user's team
            const membership = await databaseClient
                .select({ teamId: members.teamId })
                .from(members)
                .where(eq(members.userId, userId))
                .limit(1);

            if (membership.length === 0) {
                return { hasSubmission: false };
            }

            const teamId = membership[0].teamId;

            // Step 2: Check for submission by that team to the given hackathon
            const submission = await databaseClient
                .select()
                .from(submissions)
                .where(and(eq(submissions.teamId, teamId)))
                .limit(1);

            return {
                hasSubmission: submission.length > 0,
            };
        }),

    getAllSubmissions: publicProcedure
        .input(z.object({ hackathonId: z.number() }))
        .query(async ({ input }) => {
            const allSubmissions = await databaseClient
                .select({
                    ...getTableColumns(submissions),
                    teamName: teams.name,
                })
                .from(submissions)
                .innerJoin(teams, eq(submissions.teamId, teams.id))
                .where(
                    and(
                        eq(submissions.hackathonId, input.hackathonId),
                        eq(teams.hackathonId, input.hackathonId)
                    )
                );

            return allSubmissions;
        }),

    getSubmissionForTeam: publicProcedure
        .input(
            z.object({
                teamId: z.number(),
                hackathonId: z.number().optional(),
            })
        )
        .query(async ({ input }) => {
            const conditions =
                input.hackathonId != null
                    ? and(
                          eq(submissions.teamId, input.teamId),
                          eq(submissions.hackathonId, input.hackathonId)
                      )
                    : eq(submissions.teamId, input.teamId);
            const [submission] = await databaseClient
                .select()
                .from(submissions)
                .where(conditions);

            return submission ?? null;
        }),

    // getSubmissions: publicProcedure.input(querySubmissionSchema).query(async ({ input }) => {
    //     const offset = (Number(input.nextToken ?? 1) - 1) * input.maxResult
    //
    //     const hackathonIdMatchCondition = eq(submissions.hackathonId, input.hackathonId)
    //
    //     const condition =
    //         input.teamId != undefined
    //             ? and(hackathonIdMatchCondition, eq(submissions.teamId, input.teamId))
    //             : hackathonIdMatchCondition
    //
    //     const submissionsWithTeamInfo = await databaseClient
    //         .select({
    //             ...getTableColumns(submissions),
    //             teamName: teams.name,
    //         })
    //         .from(submissions)
    //         .leftJoin(teams, eq(submissions.teamId, teams.id))
    //         .where(condition)
    //         .orderBy(asc(submissions.createdDate))
    //         .limit(input.maxResult)
    //         .offset(offset)
    //
    //     // Converting date to unix timestamp before returning
    //     const result = submissionsWithTeamInfo.map((item) => ({
    //         ...item,
    //         createdDate: item.createdDate instanceof Date ? item.createdDate.getTime() : item.createdDate,
    //     }))
    //
    //     return result;
    // }),

    // updateSubmission: publicProcedure
    //     .input(updateSubmission)
    //     .mutation(async ({ input }) => {
    //         const payload: Record<string, any> = {};
    //         if (input.pendingStatus) {
    //             payload['pendingStatus'] = input.pendingStatus;
    //         }
    //
    //         if (input.status) {
    //             payload['currentStatus'] = input.status;
    //         }
    //
    //         if (input.response) {
    //             payload['response'] = input.response;
    //         }
    //
    //         const [application] = await databaseClient
    //             .update(applications)
    //             .set(payload)
    //             .where(
    //                 and(
    //                     eq(applications.hackathonId, input.hackathonId),
    //                     eq(applications.userId, input.userId)
    //                 )
    //             )
    //             .returning();
    //
    //         return application;
    //     }),
});

export type submissionRouter = typeof submissionsRouter;
