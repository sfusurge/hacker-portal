import {
    adminProcedure,
    judgeOrAdminProcedure,
    protectedProcedure,
    router,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { user, UserRoleEnum } from '@/db/schema/users/users';
import { InternalServerError, ResourceNotFoundError } from '../exceptions';
import {
    judgingAssignments,
    insertJudgingAssignmentSchema,
    getJudgingAssignmentsSchema,
    getJudgingProjectsSchema,
    getJudgingScoreSchema,
    updateJudgingAssignmentSchema,
    updateJudgingStatusSchema,
} from '@/db/schema/judge';
import { eq, and, desc, Query, not, isNull, isNotNull } from 'drizzle-orm';
import { hackathons } from '@/db/schema/hackathons';
import { getBasicUserInfo } from '@/server/auth/sessionUser';
import { submissions } from '@/db/schema/submissions';
import { teams } from '@/db/schema/teams';
import { members } from '@/db/schema/members';
import { JudgingFormQuestion } from '@/components/application_components/types';
import { hasAdminAccess } from '@/lib/auth/roles';

export interface JudgingScoreResponse {
    hackathonId: number;
    teamId: number;
    userId: number;
    response: any;
    createdDate: Date;
}

export interface JudgingProjectResponse {
    hackathonId: number;
    teamId: number;
    userId: number;
    status: string;
    createdDate: Date;
    updatedDate: Date;
}

export const judgingRouter = router({
    assignJudgingProject: adminProcedure
        .input(insertJudgingAssignmentSchema)
        .mutation(async ({ input }): Promise<JudgingProjectResponse> => {
            const [project] = await databaseClient
                .insert(judgingAssignments)
                .values({
                    hackathonId: input.hackathonId,
                    teamId: input.teamId,
                    userId: input.userId,
                    status: input.status || 'unjudged',
                })
                .onConflictDoUpdate({
                    target: [
                        judgingAssignments.hackathonId,
                        judgingAssignments.teamId,
                        judgingAssignments.userId,
                    ],
                    set: {
                        status: input.status || 'unjudged',
                        updatedDate: new Date(),
                    },
                })
                .returning();

            return {
                hackathonId: project.hackathonId,
                teamId: project.teamId,
                userId: project.userId,
                status: project.status,
                createdDate: project.createdDate,
                updatedDate: project.updatedDate,
            };
        }),

    updateJudgingProjectStatus: protectedProcedure
        .input(updateJudgingStatusSchema)
        .mutation(async ({ input, ctx }): Promise<JudgingProjectResponse> => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                ctx.user.id !== input.userId
            ) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

            const [project] = await databaseClient
                .update(judgingAssignments)
                .set({
                    status: input.status,
                    updatedDate: new Date(),
                })
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.teamId, input.teamId),
                        eq(judgingAssignments.userId, input.userId)
                    )
                )
                .returning();

            if (!project) {
                throw new InternalServerError('Project not found');
            }

            return {
                hackathonId: project.hackathonId,
                teamId: project.teamId,
                userId: project.userId,
                status: project.status,
                createdDate: project.createdDate,
                updatedDate: project.updatedDate,
            };
        }),

    getAllJudgingProjects: adminProcedure
        .input(getJudgingProjectsSchema)
        .query(async ({ input, ctx }) => {
            type DummyProject = {
                hackathonId?: number;
                teamId: number;
                userId?: number;
                status?: string;
                createdDate: Date;
                updatedDate?: Date;
                response: unknown;
                teamName: string;
            };
            let res: DummyProject[] = await databaseClient
                .select({
                    teamId: teams.id,
                    teamName: teams.name,
                    response: submissions.response,
                    createdDate: submissions.createdDate,
                })
                .from(teams)
                .innerJoin(submissions, eq(teams.id, submissions.teamId));

            for (const r of res) {
                r.hackathonId = input.hackathonId;
                r.userId = ctx.user.id;
                r.status = 'unjudged';
                r.updatedDate = new Date();
            }

            return res;
        }),

    getJudgingProjects: judgeOrAdminProcedure
        .input(getJudgingProjectsSchema)
        .query(async ({ input, ctx }) => {
            const user = ctx.user;

            let projectsQuery;
            if (hasAdminAccess(user.userRole)) {
                projectsQuery = databaseClient
                    .select({
                        hackathonId: judgingAssignments.hackathonId,
                        teamId: judgingAssignments.teamId,
                        userId: judgingAssignments.userId,
                        status: judgingAssignments.status,
                        createdDate: judgingAssignments.createdDate,
                        updatedDate: judgingAssignments.updatedDate,
                        teamName: teams.name,
                        displayId: teams.displayId,
                        response: judgingAssignments.response,
                    })
                    .from(judgingAssignments)
                    .leftJoin(
                        teams,
                        and(
                            eq(teams.id, judgingAssignments.teamId),
                            eq(
                                teams.hackathonId,
                                judgingAssignments.hackathonId
                            )
                        )
                    )
                    .where(
                        eq(judgingAssignments.hackathonId, input.hackathonId)
                    )
                    .orderBy(desc(judgingAssignments.updatedDate));
            } else {
                projectsQuery = databaseClient
                    .select({
                        hackathonId: judgingAssignments.hackathonId,
                        teamId: judgingAssignments.teamId,
                        displayId: teams.displayId,
                        userId: judgingAssignments.userId,
                        status: judgingAssignments.status,
                        createdDate: judgingAssignments.createdDate,
                        updatedDate: judgingAssignments.updatedDate,
                        response: judgingAssignments.response,
                        teamName: teams.name,
                    })
                    .from(judgingAssignments)
                    .leftJoin(
                        teams,
                        and(
                            eq(teams.id, judgingAssignments.teamId),
                            eq(
                                teams.hackathonId,
                                judgingAssignments.hackathonId
                            )
                        )
                    )
                    .where(
                        and(
                            eq(
                                judgingAssignments.hackathonId,
                                input.hackathonId
                            ),
                            eq(judgingAssignments.userId, user.id)
                        )
                    )
                    .orderBy(desc(judgingAssignments.updatedDate));
            }

            const projects = await projectsQuery;
            return projects;
        }),

    getJudgeAssignments: judgeOrAdminProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                judgeId: z.number().int().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const user = ctx.user;
            const judgeId = input.judgeId || user.id;

            if (!hasAdminAccess(user.userRole) && judgeId !== user.id) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

            const assignments = await databaseClient
                .select()
                .from(judgingAssignments)
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.userId, judgeId)
                    )
                )
                .orderBy(desc(judgingAssignments.updatedDate));

            return assignments;
        }),

    submitJudgingScore: protectedProcedure
        .input(updateJudgingAssignmentSchema)
        .mutation(async ({ input, ctx }): Promise<JudgingScoreResponse> => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                ctx.user.userRole !== UserRoleEnum.judge
            ) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

            const [score] = await databaseClient
                .update(judgingAssignments)
                .set({
                    response: input.response,
                    status: 'judged',
                    updatedDate: new Date(),
                })
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.teamId, input.teamId),
                        eq(judgingAssignments.userId, ctx.user.id)
                    )
                )
                .returning();

            return {
                hackathonId: score.hackathonId,
                teamId: score.teamId,
                userId: score.userId,
                response: score.response,
                createdDate: score.createdDate,
            };
        }),

    getJudgedProject: protectedProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                teamId: z.number(),
            })
        )
        .query(async ({ input, ctx }) => {
            const projects = await databaseClient
                .select()
                .from(judgingAssignments)
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.teamId, input.teamId),
                        eq(judgingAssignments.userId, ctx.user.id),
                        eq(judgingAssignments.status, 'judged')
                    )
                )
                .limit(1);

            return projects[0] || null;
        }),

    getJudgedProjects: judgeOrAdminProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                judgeId: z.number().int().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const user = ctx.user;
            const judgeId = input.judgeId || user.id;
            if (!hasAdminAccess(user.userRole) && judgeId !== user.id) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }
            const projects = await databaseClient
                .select({
                    teamId: judgingAssignments.teamId,
                    userId: judgingAssignments.userId,
                    createdDate: judgingAssignments.createdDate,
                })
                .from(judgingAssignments)
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.userId, judgeId),
                        eq(judgingAssignments.status, 'judged')
                    )
                )
                .orderBy(desc(judgingAssignments.createdDate));
            return projects;
        }),

    removeJudgingProject: adminProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                teamId: z.number().int(),
                userId: z.number().int(),
            })
        )
        .mutation(async ({ input }) => {
            const deleted = await databaseClient
                .delete(judgingAssignments)
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.teamId, input.teamId),
                        eq(judgingAssignments.userId, input.userId)
                    )
                )
                .returning();

            if (!deleted.length) {
                throw new InternalServerError(
                    'Assignment not found or already removed'
                );
            }

            return {
                success: true,
                message: 'Project assignment removed successfully',
                removed: {
                    hackathonId: deleted[0].hackathonId,
                    teamId: deleted[0].teamId,
                    userId: deleted[0].userId,
                },
            };
        }),

    getTeamSubmission: judgeOrAdminProcedure
        .input(
            z
                .object({
                    hackathonId: z.number().int(),
                    teamId: z.number().int().optional(),
                    displayId: z.string().length(6).optional(),
                })
                .refine((data) => data.teamId || data.displayId, {
                    message: 'Either teamId or displayId must be provided',
                })
        )
        .query(async ({ input, ctx }) => {
            const user = ctx.user;

            const whereConditions = [eq(teams.hackathonId, input.hackathonId)];

            if (input.teamId) {
                whereConditions.push(eq(teams.id, input.teamId));
            } else if (input.displayId) {
                whereConditions.push(eq(teams.displayId, input.displayId));
            }

            const [team] = await databaseClient
                .select()
                .from(teams)
                .where(and(...whereConditions))
                .limit(1);

            if (!team) {
                throw new ResourceNotFoundError({
                    id: input.teamId?.toString() || input.displayId || '',
                    resourceType: 'team',
                });
            }

            // If user is a judge, verify they are assigned to this team
            if (user.userRole === UserRoleEnum.judge) {
                const assignments = await databaseClient
                    .select()
                    .from(judgingAssignments)
                    .where(
                        and(
                            eq(
                                judgingAssignments.hackathonId,
                                input.hackathonId
                            ),
                            eq(judgingAssignments.teamId, team.id),
                            eq(judgingAssignments.userId, user.id)
                        )
                    )
                    .limit(1);

                if (assignments.length === 0) {
                    throw new TRPCError({ code: 'UNAUTHORIZED' });
                }
            }

            const [submission] = await databaseClient
                .select()
                .from(submissions)
                .where(eq(submissions.teamId, team.id))
                .limit(1);

            if (!submission) {
                return null;
            }

            return {
                teamId: submission.teamId,
                team: team,
                response: submission.response,
                createdDate: submission.createdDate,
                currentStatus: submission.currentStatus,
            };
        }),
    getUserSubmissionFeedbacks: protectedProcedure
        .input(z.object({ hackathonId: z.number().optional() }))
        .query(async ({ input }) => {
            return await getUserSubmissionFeedbacks(input.hackathonId);
        }),
});

export async function getUserSubmissionFeedbacks(hackathonId?: number) {
    const userInfo = await getBasicUserInfo();

    if (!userInfo?.id) {
        throw new InternalServerError('User not authenticated');
    }

    // get judgeassignments of submission in user's team

    const query = databaseClient
        .select({
            hackathonId: judgingAssignments.hackathonId,
            hackathonName: hackathons.name,
            judgeQuestionSchema: hackathons.judgeQuestions,
            judgeResponse: judgingAssignments.response,
            submissionResponse: submissions.response,
        })
        .from(judgingAssignments)
        .innerJoin(
            members,
            and(
                eq(members.teamId, judgingAssignments.teamId),
                eq(members.userId, userInfo.id)
            )
        )
        .innerJoin(
            submissions,
            eq(submissions.teamId, judgingAssignments.teamId)
        )
        .innerJoin(user, eq(judgingAssignments.userId, user.id))
        .innerJoin(
            hackathons,
            eq(judgingAssignments.hackathonId, hackathons.id)
        );
    let pastSubmissions;
    if (hackathonId) {
        const dynmaicQuery = query
            .$dynamic()
            .where(eq(hackathons.id, hackathonId));
        pastSubmissions = await dynmaicQuery;
    } else {
        pastSubmissions = await query;
    }

    const res = {
        ...Object.groupBy(
            pastSubmissions.filter((item) => item.judgeResponse !== null),
            (item) => item.hackathonId
        ),
    };

    return res as {
        [x: number]: {
            hackathonId: number;
            hackathonName: string;
            judgeQuestionSchema: JudgingFormQuestion[];
            judgeResponse: Record<string, any>;
            submissionResponse: Record<string, any>;
        }[];
    };
}

export type JudgingRouter = typeof judgingRouter;
