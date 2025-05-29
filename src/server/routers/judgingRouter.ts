import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import {
    judgingAssignments,
    insertJudgingAssignmentSchema,
    getJudgingAssignmentsSchema,
    getJudgingProjectsSchema,
    getJudgingScoreSchema,
    updateJudgingAssignmentSchema,
    updateJudgingStatusSchema,
} from '@/db/schema/judge';
import { eq, and, desc } from 'drizzle-orm';
import { hackathons } from '@/db/schema/hackathons';
import { getUserData } from '@/server/routers/usersRouter';
import { submissions } from '@/db/schema/submissions';
import { teams } from '@/db/schema/teams';

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
    getJudgingQuestions: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
            })
        )
        .query(async ({ input }) => {
            const judgeQuestions = await databaseClient
                .select({
                    judgeQuestions: hackathons.judgeQuestions,
                })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId));
            return judgeQuestions[0]?.judgeQuestions || null;
        }),

    assignJudgingProject: publicProcedure
        .input(insertJudgingAssignmentSchema)
        .mutation(async ({ input }): Promise<JudgingProjectResponse> => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            if (user.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

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

    updateJudgingProjectStatus: publicProcedure
        .input(updateJudgingStatusSchema)
        .mutation(async ({ input }): Promise<JudgingProjectResponse> => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            // Only allow users to update their own projects or admins to update any
            if (
                user.userRole !== UserRoleEnum.admin &&
                user.id !== input.userId
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
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

    getJudgingProjects: publicProcedure
        .input(getJudgingProjectsSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            if (
                user.userRole !== UserRoleEnum.admin &&
                user.userRole !== UserRoleEnum.judge
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

            // If admin, get all projects, otherwise get only projects assigned to the user
            let projectsQuery;
            if (user.userRole === UserRoleEnum.admin) {
                // let res: {
                //     hackathonId?: number;
                //     teamId: number;
                //     userId?: number;
                //     status?: string;
                //     createdDate: Date;
                //     updatedDate?: Date;
                //     response: unknown;
                //     teamName: string;
                // }[] = await databaseClient
                //     .select({
                //         teamId: teams.id,
                //         teamName: teams.name,
                //         response: submissions.response,
                //         createdDate: submissions.createdDate,
                //     })
                //     .from(teams)
                //     .innerJoin(submissions, eq(teams.id, submissions.teamId));

                // for (const r of res) {
                //     r.hackathonId = 2; // FIXME hardcoded hackathon number
                //     r.userId = user.id;
                //     r.status = 'unjudged';
                //     r.updatedDate = new Date();
                // }

                // return res;

                projectsQuery = databaseClient
                    .select({
                        hackathonId: judgingAssignments.hackathonId,
                        teamId: judgingAssignments.teamId,
                        userId: judgingAssignments.userId,
                        status: judgingAssignments.status,
                        createdDate: judgingAssignments.createdDate,
                        updatedDate: judgingAssignments.updatedDate,
                        teamName: teams.name,
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

    getJudgeAssignments: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                judgeId: z.number().int().optional(),
            })
        )
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            if (
                user.userRole !== UserRoleEnum.admin &&
                user.userRole !== UserRoleEnum.judge
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

            const judgeId = input.judgeId || user.id;

            // If not admin and tries to access other judge's assignments
            if (user.userRole !== UserRoleEnum.admin && judgeId !== user.id) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
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

    submitJudgingScore: publicProcedure
        .input(updateJudgingAssignmentSchema)
        .mutation(async ({ input }): Promise<JudgingScoreResponse> => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
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
                        eq(judgingAssignments.userId, user.id)
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

    getJudgedProject: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                teamId: z.number(),
            })
        )
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }
            const projects = await databaseClient
                .select()
                .from(judgingAssignments)
                .where(
                    and(
                        eq(judgingAssignments.hackathonId, input.hackathonId),
                        eq(judgingAssignments.teamId, input.teamId),
                        eq(judgingAssignments.userId, user.id),
                        eq(judgingAssignments.status, 'judged')
                    )
                )
                .limit(1);

            return projects[0] || null;
        }),

    getJudgedProjects: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                judgeId: z.number().int().optional(),
            })
        )
        .query(async ({ input }) => {
            const user = await getUserData();
            if (!user) {
                throw new InternalServerError('User not authenticated');
            }
            if (
                user.userRole !== UserRoleEnum.admin &&
                user.userRole !== UserRoleEnum.judge
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }
            const judgeId = input.judgeId || user.id;
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

    removeJudgingProject: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                teamId: z.number().int(),
                userId: z.number().int(),
            })
        )
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            if (user.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

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

    getTeamSubmission: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                teamId: z.number().int(),
            })
        )
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            if (
                user.userRole !== UserRoleEnum.admin &&
                user.userRole !== UserRoleEnum.judge
            ) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
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
                            eq(judgingAssignments.teamId, input.teamId),
                            eq(judgingAssignments.userId, user.id)
                        )
                    )
                    .limit(1);

                if (assignments.length === 0) {
                    throw new UnauthorizedError({
                        email: user.email,
                        role: user.userRole,
                    });
                }
            }

            const [submission] = await databaseClient
                .select()
                .from(submissions)
                .where(and(eq(submissions.teamId, input.teamId)))
                .limit(1);

            if (!submission) {
                return null;
            }

            return {
                teamId: submission.teamId,
                response: submission.response,
                createdDate: submission.createdDate,
                currentStatus: submission.currentStatus,
            };
        }),
});

export type JudgingRouter = typeof judgingRouter;
