import { auth } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import {
    applications,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
    updateApplicationStatusSchema,
} from '@/db/schema/applications';
import { users } from '@/db/schema/users';
import { and, asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { InternalServerError } from '../exceptions';
import { publicProcedure, router } from '../trpc';

export interface SubmitApplicationResponse {
    hackathonId: number;
    userId: number;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
}

const nullSchema = z.object({
    hackathonId: z.number().int().optional(),
});

export const applicationsRouter = router({
    userAlreadySubmitted: publicProcedure
        .input(nullSchema)
        .query(async ({ input }) => {
            const session = await auth();

            const app = await databaseClient
                .select()
                .from(applications)
                .innerJoin(
                    users,
                    and(
                        eq(applications.userId, users.id),
                        eq(users.email, session?.user?.email!)
                    )
                )
                .where(
                    input.hackathonId !== undefined
                        ? eq(applications.hackathonId, input.hackathonId)
                        : undefined
                );

            return app.length > 0;
        }),

    submitApplication: publicProcedure
        .input(insertApplicationSchema)
        .mutation(async ({ input }): Promise<SubmitApplicationResponse> => {
            const session = await auth();

            const email = session?.user?.email;

            if (!email) {
                throw new InternalServerError(
                    "Can't get email from getServerSession"
                );
            }

            const [application] = await databaseClient
                .insert(applications)
                .values({
                    userId: sql`(SELECT ${users.id} FROM ${users} WHERE ${users.email} = ${email} LIMIT 1)`,
                    hackathonId: input.hackathonId,
                    response: input.response,
                })
                .onConflictDoNothing({
                    target: [applications.hackathonId, applications.userId],
                })
                // .onConflictDoUpdate({
                //     target: [applications.hackathonId, applications.userId],
                //     set: { response: input.response },
                // })
                .returning();

            return {
                ...application,
                response: application.response as Record<string, unknown>,
            };
        }),

    getApplications: publicProcedure
        .input(queryApplicationsSchema)
        .query(async ({ input }) => {
            // https://orm.drizzle.team/docs/guides/limit-offset-pagination
            const offset = (Number(input.nextToken ?? 1) - 1) * input.maxResult;

            const hackathonIdMatchCondition = eq(
                applications.hackathonId,
                input.hackathonId
            );

            const condition =
                input.userId != undefined
                    ? and(
                          hackathonIdMatchCondition,
                          eq(applications.userId, input.userId)
                      )
                    : hackathonIdMatchCondition;

            return await databaseClient
                .select()
                .from(applications)
                .where(condition)
                .orderBy(asc(applications.createdDate))
                .limit(input.maxResult)
                .offset(offset);
        }),

    updateApplicationStatus: publicProcedure
        .input(updateApplicationStatusSchema)
        .mutation(async ({ input }) => {
            const [application] = await databaseClient
                .update(applications)
                .set({
                    currentStatus: input.status,
                    pendingStatus: input.pendingStatus,
                })
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        eq(applications.userId, input.userId)
                    )
                )
                .returning();

            return application;
        }),
});

export type ApplicationsRouter = typeof applicationsRouter;
