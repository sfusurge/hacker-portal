import { databaseClient } from '@/db/client';
import {
    applications,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
    updateApplicationStatusSchema,
} from '@/db/schema/applications';
import { getUserData, users } from '@/db/schema/users/users';
import { and, asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { InternalServerError } from '../exceptions';
import { publicProcedure, router } from '../trpc';
import Handlebars from 'handlebars';
import { welcomeEmailTemplate } from '@/server/routers/templates';
import { transporter } from '@/server/nodemailerTransporter';

export interface SubmitApplicationResponse {
    hackathonId: number;
    userId: number;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
}

export const applicationsRouter = router({
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
                from: process.env.SENDINGEMAIL,
                to: user.email,
                subject: "We've Received Your JourneyHacks Application 😎",
                text: 'Thank you for applying to JourneyHacks!',
                html: htmlContent,
            };

            let sfuMailOptions = {
                from: process.env.SENDINGEMAIL,
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

    getCurrentApplication: publicProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError(
                    'Unexpected `undefined` userData'
                );
            }

            const [application] = await databaseClient
                .select()
                .from(applications)
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        eq(applications.userId, user.id)
                    )
                )
                .limit(1);

            return application ?? null;
        }),
});

export type ApplicationsRouter = typeof applicationsRouter;
