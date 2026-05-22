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
import { BadRequestError } from '@/server/exceptions';
import { isSubmissionWindowOpen } from '@/lib/submissionWindow';
import { publicProcedure, router } from '../trpc';
import { getUserData } from './usersRouter';
import type { InputFormPageData } from '@/components/application_components/types';
import { mapSubmissionToProjectListItem } from '@/lib/projects/projectSubmissionDisplay';

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
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            const userInfo = await getUserData();
            const [submission] = await databaseClient
                .select(getTableColumns(submissions))
                .from(submissions)
                .innerJoin(members, eq(members.teamId, submissions.teamId))
                .innerJoin(teams, eq(teams.id, submissions.teamId))
                .where(
                    and(
                        eq(members.userId, userInfo?.id ?? -1),
                        eq(submissions.hackathonId, input.hackathonId),
                        eq(teams.hackathonId, input.hackathonId)
                    )
                )
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

            const [hackathonRow] = await databaseClient
                .select({
                    submissionOpen: hackathons.submissionOpen,
                    submissionDeadline: hackathons.submissionDeadline,
                })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId))
                .limit(1);

            if (
                !hackathonRow ||
                !isSubmissionWindowOpen(
                    Date.now(),
                    hackathonRow.submissionOpen,
                    hackathonRow.submissionDeadline
                )
            ) {
                throw new BadRequestError(
                    'Project submissions are only accepted during the open submission window.'
                );
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
                userId: 0,
                response: submission.response as Record<string, unknown>,
                createdDate: submission.createdDate,
                currentStatus: submission.currentStatus,
            };
        }),

    getHasSubmissions: publicProcedure
        .input(getHasSubmissionSchema)
        .query(async ({ input }) => {
            const { userId, hackathonId } = input;

            // Step 1: Find the user's team for this hackathon
            const membership = await databaseClient
                .select({ teamId: members.teamId })
                .from(members)
                .innerJoin(teams, eq(teams.id, members.teamId))
                .where(
                    and(
                        eq(members.userId, userId),
                        eq(teams.hackathonId, hackathonId)
                    )
                )
                .limit(1);

            if (membership.length === 0) {
                return { hasSubmission: false };
            }

            const teamId = membership[0].teamId;

            // Step 2: Check for submission by that team for this hackathon
            const submission = await databaseClient
                .select()
                .from(submissions)
                .where(
                    and(
                        eq(submissions.teamId, teamId),
                        eq(submissions.hackathonId, hackathonId)
                    )
                )
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

    // fetch all submissions for the gallery grid (mapped list fields only)
    getProjectGalleryItems: publicProcedure
        .input(z.object({ hackathonId: z.number() }))
        .query(async ({ input }) => {
            const [hackathonRow] = await databaseClient
                .select({
                    submissionQuestions: hackathons.submissionQuestions,
                })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId))
                .limit(1);

            const submissionQuestionPages =
                (hackathonRow?.submissionQuestions ??
                    []) as InputFormPageData[];

            const rows = await databaseClient
                .select({
                    teamId: submissions.teamId,
                    teamName: teams.name,
                    response: submissions.response,
                })
                .from(submissions)
                .innerJoin(teams, eq(submissions.teamId, teams.id))
                .where(
                    and(
                        eq(submissions.hackathonId, input.hackathonId),
                        eq(teams.hackathonId, input.hackathonId)
                    )
                );

            return rows.map((row) =>
                mapSubmissionToProjectListItem(
                    {
                        teamId: row.teamId,
                        teamName: row.teamName,
                        response: (row.response ?? {}) as Record<
                            string,
                            unknown
                        >,
                    },
                    { submissionQuestionPages }
                )
            );
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
