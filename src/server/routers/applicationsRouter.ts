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
import Handlebars from 'handlebars';
import { welcomeEmailTemplate } from '@/server/routers/templates';
import { transporter } from '@/server/nodemailerTransporter';
import { getUserData } from '@/app/(auth)/layout';
const env = process.env;

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
            const user = await getUserData();

            const app = await databaseClient
                .select()
                .from(applications)
                .innerJoin(
                    users,
                    and(
                        eq(applications.userId, users.id),
                        eq(users.email, user?.email!)
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
            const user = await getUserData();

            const email = user?.email;

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

            //based on code copied from rewviewappplications table lmao
            const tempDummy = (item: any) => {
                const { '1': name, '2': email } = item.response || {};
                return { name, email };
            };

            if (!user?.email) {
                throw new InternalServerError(
                    'User email is missing. Cannot send email.'
                );
            }

            const extractedEmail = tempDummy(input).email;
            if (!extractedEmail) {
                throw new InternalServerError(
                    'User email is missing. Cannot send email.'
                );
            }

            const template = Handlebars.compile(welcomeEmailTemplate);
            const htmlContent = template({
                firstName: tempDummy(input).name,
            });

            let oAuthMailOptions = {
                from: env.SENDINGEMAIL,
                to: user.email,
                subject: "We've Received Your JourneyHacks Application 😎",
                text: 'Thank you for applying to JourneyHacks!',
                html: htmlContent,
            };

            let sfuMailOptions = {
                from: env.SENDINGEMAIL,
                to: extractedEmail,
                subject: "We've Received Your JourneyHacks Application 😎",
                text: 'Thank you for applying to JourneyHacks!',
                html: htmlContent,
            };

            transporter.sendMail(oAuthMailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            transporter.sendMail(sfuMailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

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
    getApplicationStatus: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                userId: z.number().int().optional(),
            })
        )
        .query(async ({ input }) => {
            let userId: number;

            if (input.userId) {
                userId = input.userId;
            } else {
                const user = await getUserData();

                userId = user?.id!;
            }

            const [application] = await databaseClient
                .select({
                    currentStatus: applications.currentStatus,
                    pendingStatus: applications.pendingStatus,
                })
                .from(applications)
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        eq(applications.userId, userId)
                    )
                )
                .limit(1);

            return application ?? null;
        }),
});

export type ApplicationsRouter = typeof applicationsRouter;
