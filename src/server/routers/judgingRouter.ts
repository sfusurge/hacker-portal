import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { getUserData, UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import {
    judgingScores,
    insertJudgingScoreSchema,
    getJudgingProjectsSchema,
    getJudgingScoreSchema,
} from '@/db/schema/judge';
import { eq, and, desc } from 'drizzle-orm';
import { hackathons } from '@/db/schema/hackathons';

export interface JudgingScoreResponse {
    hackathonId: number;
    teamId: number;
    projectId: number;
    userId: number;
    response: any;
    createdDate: Date;
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
    submitJudgingScore: publicProcedure
        .input(insertJudgingScoreSchema)
        .mutation(async ({ input }): Promise<JudgingScoreResponse> => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            const [score] = await databaseClient
                .insert(judgingScores)
                .values({
                    hackathonId: input.hackathonId,
                    teamId: input.teamId,
                    projectId: input.projectId,
                    userId: user.id,
                    response: input.response,
                })
                .onConflictDoUpdate({
                    target: [
                        judgingScores.hackathonId,
                        judgingScores.teamId,
                        judgingScores.projectId,
                        judgingScores.userId,
                    ],
                    set: {
                        response: input.response,
                    },
                })
                .returning();

            return {
                hackathonId: score.hackathonId,
                teamId: score.teamId,
                projectId: score.projectId,
                userId: score.userId,
                response: score.response,
                createdDate: score.createdDate,
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

            // const hackathonData = await databaseClient
            //     .select({ judgingProjects:  })
            //     .from(hackathons)
            //     .where(eq(hackathons.id, input.hackathonId));

            // return hackathonData[0]?.judgingProjects || null;
        }),

    getJudgedProject: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                projectId: z.number(),
            })
        )
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }
            const projects = await databaseClient
                .select()
                .from(judgingScores)
                .where(
                    and(
                        eq(judgingScores.hackathonId, input.hackathonId),
                        eq(judgingScores.projectId, input.projectId),
                        eq(judgingScores.userId, user.id)
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
                    projectId: judgingScores.projectId,
                    teamId: judgingScores.teamId,
                    userId: judgingScores.userId,
                    createdDate: judgingScores.createdDate,
                })
                .from(judgingScores)
                .where(
                    and(
                        eq(judgingScores.hackathonId, input.hackathonId),
                        eq(judgingScores.userId, judgeId)
                    )
                )
                .orderBy(desc(judgingScores.createdDate));
            return projects;
        }),

    getJudgingScore: publicProcedure
        .input(getJudgingScoreSchema)
        .query(async ({ input }) => {
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

            const judgeId = input.judgeId || user.id;

            const [score] = await databaseClient
                .select()
                .from(judgingScores)
                .where(
                    and(
                        eq(judgingScores.hackathonId, input.hackathonId),
                        eq(judgingScores.projectId, input.projectId),
                        eq(judgingScores.userId, judgeId)
                    )
                )
                .limit(1);

            return score || null;
        }),

    getUserJudgingScores: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
            })
        )
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            // Judges can only see their own scores
            const scores = await databaseClient
                .select()
                .from(judgingScores)
                .where(
                    and(
                        eq(judgingScores.hackathonId, input.hackathonId),
                        eq(judgingScores.userId, user.id)
                    )
                )
                .orderBy(desc(judgingScores.createdDate));

            return scores;
        }),
});

export type JudgingRouter = typeof judgingRouter;
