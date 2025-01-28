import {
    applications,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
    updateApplicationStatusSchema,
} from '@/db/schema/applications';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { users } from '@/db/schema/users';
import { InternalServerError } from '../exceptions';
import { auth } from '@/auth/auth';
import { z } from 'zod';

export interface SubmitApplicationResponse {
    hackathonId: number;
    userId: number;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
}

const nullSchema = z.object({});

export const applicationsRouter = router({
    userAlreadySubmitted: publicProcedure
        .input(nullSchema)
        .query(async ({ input }) => {
            const session = await auth();

            const user = (
                await databaseClient
                    .select()
                    .from(users)
                    .where(eq(users.email, session?.user?.email!))
            )[0];
            if (!user) {
                return false;
            }

            const app = (
                await databaseClient
                    .select()
                    .from(applications)
                    .where(eq(applications.userId, user.id))
            )[0];

            return app !== undefined;
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
                .onConflictDoUpdate({
                    target: [applications.hackathonId, applications.userId],
                    set: { response: input.response },
                })
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
