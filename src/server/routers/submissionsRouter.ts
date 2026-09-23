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
import {
    adminProcedure,
    protectedProcedure,
    publicProcedure,
    router,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { hasAdminAccess } from '@/lib/auth/roles';
import { getUserData } from '@/server/auth/sessionUser';
import { canAccessProjectGallery } from '@/lib/submissionWindow';
import type { InputFormPageData } from '@/components/application_components/types';
import { mapSubmissionToProjectListItem } from '@/lib/projects/projectSubmissionDisplay';
import { judgingAssignments } from '@/db/schema/judge';
import {
    flattenSubmissionQuestions,
    hasDisplayRole,
    isVisibleForUserRole,
    satisfiesSubmissionVisibleWhen,
} from '@/lib/projects/submissionFormQuestions';

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
    getUserTeamSubmission: protectedProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input, ctx }) => {
            const [submission] = await databaseClient
                .select(getTableColumns(submissions))
                .from(submissions)
                .innerJoin(members, eq(members.teamId, submissions.teamId))
                .innerJoin(teams, eq(teams.id, submissions.teamId))
                .where(
                    and(
                        eq(members.userId, ctx.user.id),
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

    submitSubmission: protectedProcedure
        .input(insertSubmissionSchema)
        .mutation(async ({ input, ctx }): Promise<SubmitSubmissionResponse> => {
            const [team] = await databaseClient
                .select({ hackathonId: teams.hackathonId })
                .from(teams)
                .where(eq(teams.id, input.teamId))
                .limit(1);
            if (!team || team.hackathonId !== input.hackathonId) {
                throw new Error('Team does not belong to this hackathon');
            }

            const [membership] = await databaseClient
                .select({ userId: members.userId })
                .from(members)
                .where(
                    and(
                        eq(members.teamId, input.teamId),
                        eq(members.userId, ctx.user.id)
                    )
                )
                .limit(1);
            if (!membership) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You must be on this team to submit a project.',
                });
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
                userId: ctx.user.id,
                response: submission.response as Record<string, unknown>,
                createdDate: submission.createdDate,
                currentStatus: submission.currentStatus,
            };
        }),

    getHasSubmissions: protectedProcedure
        .input(getHasSubmissionSchema)
        .query(async ({ input, ctx }) => {
            const { userId, hackathonId } = input;
            if (!hasAdminAccess(ctx.user.userRole) && ctx.user.id !== userId) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

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

    getAllSubmissions: adminProcedure
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
                    projectGalleryOpen: hackathons.projectGalleryOpen,
                    submissionDeadline: hackathons.submissionDeadline,
                    submissionOpen: hackathons.submissionOpen,
                })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId))
                .limit(1);

            if (!hackathonRow) return [];

            const viewer = await getUserData();
            if (
                !canAccessProjectGallery(
                    Date.now(),
                    hackathonRow.projectGalleryOpen,
                    hackathonRow.submissionDeadline,
                    viewer?.userRole,
                    hackathonRow.submissionOpen
                )
            ) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'The project gallery is not open yet.',
                });
            }

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

    getSubmissionForTeam: protectedProcedure
        .input(
            z.object({
                teamId: z.number(),
                hackathonId: z.number().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const [team] = await databaseClient
                .select({ hackathonId: teams.hackathonId })
                .from(teams)
                .where(eq(teams.id, input.teamId))
                .limit(1);
            if (
                !team ||
                (input.hackathonId != null &&
                    team.hackathonId !== input.hackathonId)
            ) {
                return null;
            }

            const isAdmin = hasAdminAccess(ctx.user.userRole);
            const [membership] = await databaseClient
                .select({ userId: members.userId })
                .from(members)
                .where(
                    and(
                        eq(members.teamId, input.teamId),
                        eq(members.userId, ctx.user.id)
                    )
                )
                .limit(1);
            let isAssignedJudge = false;
            if (ctx.user.userRole === 'judge') {
                const [assignment] = await databaseClient
                    .select({ userId: judgingAssignments.userId })
                    .from(judgingAssignments)
                    .where(
                        and(
                            eq(
                                judgingAssignments.hackathonId,
                                team.hackathonId
                            ),
                            eq(judgingAssignments.teamId, input.teamId),
                            eq(judgingAssignments.userId, ctx.user.id)
                        )
                    )
                    .limit(1);
                isAssignedJudge = Boolean(assignment);
            }

            const [submission] = await databaseClient
                .select()
                .from(submissions)
                .where(
                    and(
                        eq(submissions.teamId, input.teamId),
                        eq(submissions.hackathonId, team.hackathonId)
                    )
                )
                .limit(1);
            if (!submission) return null;
            if (isAdmin || membership || isAssignedJudge) return submission;

            const [hackathon] = await databaseClient
                .select({ submissionQuestions: hackathons.submissionQuestions })
                .from(hackathons)
                .where(eq(hackathons.id, team.hackathonId))
                .limit(1);
            const response = (submission.response ?? {}) as Record<
                string,
                unknown
            >;
            const visibleQuestionIds = new Set(
                flattenSubmissionQuestions(
                    (hackathon?.submissionQuestions ??
                        []) as InputFormPageData[]
                )
                    .filter(
                        (question) =>
                            question.questionId != null &&
                            (isVisibleForUserRole(question, 'user') ||
                                hasDisplayRole(question, 'banner')) &&
                            satisfiesSubmissionVisibleWhen(question, response)
                    )
                    .map((question) => String(question.questionId))
            );
            const { currentStatus, ...publicSubmission } = submission;
            void currentStatus;
            return {
                ...publicSubmission,
                response: Object.fromEntries(
                    Object.entries(response).filter(([key]) =>
                        visibleQuestionIds.has(key)
                    )
                ),
            };
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
