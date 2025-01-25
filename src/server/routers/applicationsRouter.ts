import {
    applications,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
} from '@/db/schema/applications';
import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { users } from '@/db/schema/users';
import { InternalServerError } from '../exceptions';

export interface SubmitApplicationResponse {
    hackathonId: number;
    userId: string;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
}

export const applicationsRouter = router({
    submitApplication: publicProcedure
        .input(insertApplicationSchema)
        .mutation(async ({ input }): Promise<SubmitApplicationResponse> => {
            const session = await getServerSession();

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
});
