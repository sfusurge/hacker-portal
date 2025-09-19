import { databaseClient } from '@/db/client';
import {
    applications,
    batchUpdateApplicationStatusSchema,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
    updateApplicationStatusSchema,
} from '@/db/schema/applications';
import { user } from '@/db/schema/users/users';
import { and, asc, eq, getTableColumns, desc, or, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { InternalServerError } from '../exceptions';
import { publicProcedure, router } from '../trpc';
import Handlebars from 'handlebars';
import { welcomeStormhacksTemplate } from '@/server/routers/templates';
import { transporter } from '@/server/nodemailerTransporter';
import { teams } from '@/db/schema/teams';
import { members } from '@/db/schema/members';
import { getBasicUserInfo, getUserData } from '@/server/routers/usersRouter';
import { checkIns } from '@/db/schema/checkIn';
import { events } from '@/db/schema/events';

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

            if (application) {
                //based on code copied from rewviewappplications table lmao
                const tempDummy = (item: any) => {
                    const { '1': firstName, '4': email } = item.response || {};
                    return { firstName, email };
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

                const template = Handlebars.compile(welcomeStormhacksTemplate);
                const htmlContent = template({
                    firstName: tempDummy(input).firstName,
                });

                let oAuthMailOptions = {
                    from: process.env.SENDINGEMAIL,
                    to: user.email,
                    subject: 'Your StormHacks Application Has Been Received!',
                    text: 'Your StormHacks Application Has Been Received!',
                    html: htmlContent,
                };

                let sfuMailOptions = {
                    from: process.env.SENDINGEMAIL,
                    to: extractedEmail,
                    subject: 'Your StormHacks Application Has Been Received!',
                    text: 'Your StormHacks Application Has Been Received!',
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
            }

            return {
                ...application,
                response: application.response as Record<string, unknown>,
            };
        }),

    getApplications: publicProcedure
        .input(queryApplicationsSchema)
        .query(async ({ input }) => {
            const offset = Number(input.cursor ?? 0);

            const applicationsWithTeamInfo = await databaseClient
                .select({
                    ...getTableColumns(applications),
                })
                .from(applications)
                .where(eq(applications.hackathonId, input.hackathonId))
                .orderBy(asc(applications.createdDate))
                .limit(input.maxResult)
                .offset(offset);

            const teamInfos = await databaseClient
                .select({
                    teamId: teams.id,
                    teamName: teams.name,
                    userId: members.userId,
                    response: applications.response,
                })
                .from(teams)
                .innerJoin(members, eq(members.teamId, teams.id))
                .innerJoin(
                    applications,
                    and(
                        eq(applications.userId, members.userId),
                        eq(applications.hackathonId, input.hackathonId)
                    )
                )
                .where(eq(teams.hackathonId, input.hackathonId));

            const userIdToTeamMap = new Map(
                teamInfos.map((teamInfo) => [teamInfo.userId, teamInfo])
            );

            const teamIdToMembers = Object.groupBy(
                teamInfos,
                ({ teamId }) => teamId
            );

            const checkInInfos = await databaseClient
                .select({
                    userId: checkIns.userId,
                    eventId: events.id,
                    eventTitle: events.title,
                    checkInTime: checkIns.checkInTime,
                })
                .from(events)
                .leftJoin(checkIns, eq(checkIns.eventId, events.id))
                .innerJoin(
                    applications,
                    and(
                        eq(checkIns.userId, applications.userId),
                        eq(applications.hackathonId, input.hackathonId)
                    )
                )
                .where(and(eq(events.hackathonId, input.hackathonId)));

            const userToEvents = Object.groupBy(
                checkInInfos.filter(({ userId }) => userId !== null),
                ({ userId }) => userId!
            );

            const applicationsWithAllInfos: ApplicationWithTeamInfo[] =
                applicationsWithTeamInfo.map(
                    ({ createdDate, ...application }) => {
                        const teamId =
                            userIdToTeamMap.get(application.userId)?.teamId ??
                            null;

                        const teamName =
                            userIdToTeamMap.get(application.userId)?.teamName ??
                            null;

                        const members =
                            teamId !== null
                                ? teamIdToMembers[teamId]!.map((memberInfo) => {
                                      const firstName = (
                                          memberInfo.response as Record<
                                              string,
                                              string
                                          >
                                      )['1'];

                                      const lastName = (
                                          memberInfo.response as Record<
                                              string,
                                              string
                                          >
                                      )['2'];
                                      return `${firstName} ${lastName}`;
                                  })
                                : [];

                        const checkIns = (
                            userToEvents[application.userId] ?? []
                        ).map(({ userId, checkInTime, ...info }) => ({
                            ...info,
                            checkedIn: checkInTime != null,
                        }));

                        return {
                            ...application,
                            response: application.response as Record<
                                string,
                                any
                            >,
                            teamId,
                            teamName,
                            checkIns,
                            // converting date to unix timestamp before returning
                            // suppressing warning to avoid uncessesary type conversion.
                            createdDate: createdDate?.getTime(),
                            members,
                        };
                    }
                );

            const nextToken =
                applicationsWithAllInfos.length !== 0
                    ? `${offset + applicationsWithAllInfos.length}`
                    : null;

            // console.log({ applicationsWithAllInfos, nextToken });
            return {
                applications:
                    applicationsWithAllInfos as ApplicationWithTeamInfo[],
                nextToken,
            };
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

    updateApplicationBatch: publicProcedure
        .input(batchUpdateApplicationStatusSchema)
        .mutation(async ({ input }) => {
            const updatedApplications = await databaseClient
                .update(applications)
                .set({
                    pendingStatus: input.pendingStatus ?? undefined,
                    currentStatus: input.status ?? undefined,
                })
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        inArray(applications.userId, input.userIds)
                    )
                )
                .returning();

            return updatedApplications;
        }),

    getCurrentApplication: publicProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            const user = await getBasicUserInfo();

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
                .orderBy(desc(applications.createdDate))
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
            const applications_result = await databaseClient
                .select(getTableColumns(applications))
                .from(applications)
                .innerJoin(user, eq(applications.userId, user.id))
                .where(eq(user.email, input.email))
                .orderBy(desc(applications.createdDate));
            return applications_result as ApplicationInfo[];
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
    checkIns: {
        eventId: number;
        eventTitle: string;
        checkedIn: boolean;
    }[];
    members: string[];
}

export interface ApplicationInfo {
    response: Record<string, any>;
    hackathonId: number;
    userId: number;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
    createdDate: Date;
}
