import { databaseClient } from '@/db/client';
import {
    applications,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
    updateApplicationStatusSchema,
} from '@/db/schema/applications';
import { getUserData, user } from '@/db/schema/users/users';
import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';
import { InternalServerError } from '../exceptions';
import { publicProcedure, router } from '../trpc';
import Handlebars from 'handlebars';
import { welcomeSparkhacksTemplate } from '@/server/routers/templates';
import { transporter } from '@/server/nodemailerTransporter';
import { teams } from '@/db/schema/teams';
import { members } from '@/db/schema/members';

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
                    userId: user.id,
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
                const { '2': name, '5': email } = item.response || {};
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

            const template = Handlebars.compile(welcomeSparkhacksTemplate);
            const htmlContent = template({
                // firstName: tempDummy(input).name,
            });

            let oAuthMailOptions = {
                from: process.env.SENDINGEMAIL,
                to: user.email,
                subject: 'Your SparkJam Application Has Been Received!',
                text: 'Your SparkJam Application Has Been Received!',
                html: htmlContent,
            };

            let sfuMailOptions = {
                from: process.env.SENDINGEMAIL,
                to: extractedEmail,
                subject: 'Your SparkJam Application Has Been Received!',
                text: 'Your SparkJam Application Has Been Received!',
                html: htmlContent,
            };

            if (user.email != extractedEmail) {
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
            } else {
                transporter.sendMail(oAuthMailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
            }

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

            const applicationsWithTeamInfo = await databaseClient
                .select({
                    ...getTableColumns(applications),
                    response: applications.response,
                    teamId: members.teamId,
                    teamName: teams.name,
                })
                .from(applications)
                .leftJoin(members, eq(applications.userId, members.userId))
                .leftJoin(teams, eq(members.teamId, teams.id))
                .where(condition)
                .orderBy(asc(applications.createdDate))
                .limit(input.maxResult)
                .offset(offset);

            // converting date to unix timestamp before returning
            // suppressing warning to avoid uncessesary type conversion.
            applicationsWithTeamInfo.forEach(
                // @ts-ignore
                (item) => (item.createdDate = item.createdDate.getTime())
            );
            // @ts-ignore
            return applicationsWithTeamInfo as ApplicationWithTeamInfo[];
        }),

    updateApplication: publicProcedure
        .input(updateApplicationStatusSchema)
        .mutation(async ({ input }) => {
            const payload: Record<string, any> = {};
            if (input.pendingStatus) {
                payload['pendingStatus'] = input.pendingStatus;
            }

            if (input.status) {
                payload['currentStatus'] = input.status;
            }

            if (input.response) {
                payload['response'] = input.response;
            }

            const [application] = await databaseClient
                .update(applications)
                .set(payload)
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

    getApplicationByEmail: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
            })
        )
        .query(async ({ input }) => {
            const [application] = await databaseClient
                .select(getTableColumns(applications))
                .from(applications)
                .innerJoin(user, eq(applications.userId, user.id))
                .where(eq(user.email, input.email))
                .limit(1);

            return application as ApplicationInfo;
        }),

    getApplicationsByEmail: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
            })
        )
        .query(async ({ input }) => {
            const [application] = await databaseClient
                .select(getTableColumns(applications))
                .from(applications)
                .innerJoin(user, eq(applications.userId, user.id))
                .where(eq(user.email, input.email));
            return application as ApplicationInfo;
        }),
});

export type ApplicationsRouter = typeof applicationsRouter;

export interface ApplicationWithTeamInfo {
    response: Record<string, any>;
    teamId: number | null;
    teamName: string | null;
    hackathonId: number;
    userId: number;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
    createdDate: number;
}

export interface ApplicationInfo {
    response: Record<string, any>;
    hackathonId: number;
    userId: number;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
    createdDate: Date;
}
