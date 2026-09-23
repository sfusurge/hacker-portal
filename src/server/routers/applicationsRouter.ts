import { databaseClient } from '@/db/client';
import {
    applications,
    batchUpdateApplicationStatusSchema,
    batchUpdateLastEmailSentSchema,
    insertApplicationSchema,
    queryApplicationsSchema,
    StatusEnum,
    updateApplicationStatusSchema,
    updateLastEmailSentSchema,
} from '@/db/schema/applications';
import { user } from '@/db/schema/users/users';
import {
    and,
    asc,
    eq,
    getTableColumns,
    desc,
    inArray,
    sql,
    count,
} from 'drizzle-orm';
import { z } from 'zod';
import { InternalServerError } from '../exceptions';
import { TRPCError } from '@trpc/server';
import {
    adminProcedure,
    adminOrSponsorProcedure,
    protectedProcedure,
    router,
} from '../trpc';
import { transporter } from '@/server/nodemailerTransporter';
import { teams } from '@/db/schema/teams';
import { members } from '@/db/schema/members';
import { checkIns } from '@/db/schema/checkIn';
import { events } from '@/db/schema/events';
import { emailTemplates, emailTemplateStyling } from '@/db/schema/emails';
import {
    markdownToHtml,
    mergeBodyIntoStyling,
    prepareEmailContent,
} from '@/app/(auth)/admin/email/templates/emailPreview';
import { publishReviewTableEvent } from '@/lib/realtime/publishReviewTableEvent';
import { hasAdminAccess } from '@/lib/auth/roles';

type UpdateApplicationInput = z.infer<typeof updateApplicationStatusSchema>;
type UpdateLastEmailSentInput = z.infer<typeof updateLastEmailSentSchema>;

// shared write path for tRPC + trusted server callers (Stripe webhook / RSVP result)
export async function applyApplicationStatusUpdate(
    input: UpdateApplicationInput
) {
    const payload: Record<string, unknown> = {};
    if (input.pendingStatus) {
        payload['pendingStatus'] = input.pendingStatus;
    }

    if (input.status) {
        payload['currentStatus'] = input.status;
    }

    if (input.flagged !== undefined) {
        payload['flagged'] = input.flagged;
    }

    if (input.hsFlagged !== undefined) {
        payload['hsFlagged'] = input.hsFlagged;
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

    if (
        application &&
        (input.status !== undefined ||
            input.pendingStatus !== undefined ||
            input.flagged !== undefined ||
            input.hsFlagged !== undefined)
    ) {
        void publishReviewTableEvent({
            hackathonId: input.hackathonId,
        });
    }

    return application;
}

export async function applyLastEmailSentUpdate(
    input: UpdateLastEmailSentInput
) {
    const [application] = await databaseClient
        .update(applications)
        .set({
            lastEmailSent: input.emailType,
        })
        .where(
            and(
                eq(applications.hackathonId, input.hackathonId),
                eq(applications.userId, input.userId)
            )
        )
        .returning();

    return application;
}

export interface SubmitApplicationResponse {
    hackathonId: number;
    userId: number;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
    flagged: boolean;
    hsFlagged: boolean;
}

export const applicationsRouter = router({
    submitApplication: protectedProcedure
        .input(insertApplicationSchema)
        .mutation(
            async ({ input, ctx }): Promise<SubmitApplicationResponse> => {
                const user = ctx.user;
                const email = user.email;

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
                    try {
                        const [template] = await databaseClient
                            .select()
                            .from(emailTemplates)
                            .where(
                                and(
                                    eq(
                                        emailTemplates.hackathonId,
                                        input.hackathonId
                                    ),
                                    eq(
                                        emailTemplates.emailType,
                                        'hacker_applied'
                                    )
                                )
                            )
                            .limit(1);

                        if (!template) {
                            console.error(
                                `No hacker_applied email template found for hackathon ${input.hackathonId}`
                            );
                        } else {
                            let processedTemplateContent =
                                template.stylingId != null
                                    ? markdownToHtml(template.content)
                                    : template.content;

                            const templateData = {
                                firstName: user.firstName ?? 'Friend',
                                lastName: user.lastName ?? '',
                                email: user.email,
                                userId: user.id,
                            };

                            let finalHtmlContent = prepareEmailContent(
                                processedTemplateContent,
                                templateData
                            );

                            if (template.stylingId != null) {
                                const [styling] = await databaseClient
                                    .select()
                                    .from(emailTemplateStyling)
                                    .where(
                                        eq(
                                            emailTemplateStyling.id,
                                            template.stylingId
                                        )
                                    )
                                    .limit(1);
                                if (styling?.html) {
                                    finalHtmlContent = mergeBodyIntoStyling(
                                        styling.html,
                                        finalHtmlContent
                                    );
                                }
                            }

                            await transporter.sendMail({
                                from: process.env.SENDINGEMAIL,
                                subject: template.title,
                                html: finalHtmlContent,
                                to: user.email,
                            });

                            await databaseClient
                                .update(applications)
                                .set({ lastEmailSent: 'hacker_applied' })
                                .where(
                                    and(
                                        eq(
                                            applications.hackathonId,
                                            input.hackathonId
                                        ),
                                        eq(applications.userId, user.id)
                                    )
                                );
                        }
                    } catch (error) {
                        console.error(
                            'Error preparing or sending hacker_applied email:',
                            error
                        );
                    }
                }

                return {
                    ...application,
                    response: application.response as Record<string, unknown>,
                };
            }
        ),

    getApplications: adminOrSponsorProcedure
        .input(queryApplicationsSchema)
        .query(async ({ input }) => {
            const offset = Number(input.cursor ?? 0);

            const applicationInfos = await databaseClient
                .select({
                    ...getTableColumns(applications),
                })
                .from(applications)
                .where(eq(applications.hackathonId, input.hackathonId))
                .orderBy(asc(applications.createdDate))
                // add 1 to see if there are still results
                .limit(input.maxResult + 1)
                .offset(offset);

            const teamInfos = await databaseClient
                .select({
                    teamId: teams.id,
                    teamName: teams.name,
                    userId: members.userId,
                    firstName: sql<string>`${applications.response}->>'5'`,
                    lastName: sql<string>`${applications.response}->>'6'`,
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
                    eventId: events.id,
                    eventTitle: events.title,
                    userId: checkIns.userId,
                    checkInTime: checkIns.checkInTime,
                })
                .from(events)
                .innerJoin(checkIns, eq(events.id, checkIns.eventId))
                .where(
                    and(
                        eq(events.hackathonId, input.hackathonId),
                        eq(events.hasCheckIn, true)
                    )
                );

            const eventIdToCheckInfos = new Map<
                number,
                [string, Map<number, Date>]
            >();

            for (const checkInInfo of checkInInfos) {
                const eventId = checkInInfo.eventId;

                if (eventIdToCheckInfos.has(eventId)) {
                    const [, checkedInUsers] =
                        eventIdToCheckInfos.get(eventId)!;

                    if (checkInInfo.userId != null) {
                        checkedInUsers.set(
                            checkInInfo.userId,
                            checkInInfo.checkInTime as unknown as Date
                        );
                    }
                } else {
                    const map = new Map<number, Date>();
                    if (checkInInfo.userId != null) {
                        map.set(
                            checkInInfo.userId,
                            checkInInfo.checkInTime as unknown as Date
                        );
                    }
                    eventIdToCheckInfos.set(eventId, [
                        checkInInfo.eventTitle,
                        map,
                    ]);
                }
            }

            const applicationsWithAllInfos: ApplicationWithTeamInfo[] =
                applicationInfos.map(({ createdDate, ...application }) => {
                    const teamId =
                        userIdToTeamMap.get(application.userId)?.teamId ?? null;

                    const teamName =
                        userIdToTeamMap.get(application.userId)?.teamName ??
                        null;

                    const members =
                        teamId !== null
                            ? teamIdToMembers[teamId]!.map((memberInfo) => {
                                  return `${memberInfo.firstName} ${memberInfo.lastName}`;
                              })
                            : [];

                    const checkIns = [...eventIdToCheckInfos.entries()].map(
                        ([eventId, [eventTitle, checkedInUsers]]) => ({
                            eventId,
                            eventTitle,
                            checkedIn: checkedInUsers.has(application.userId),
                            checkInTime:
                                checkedInUsers.get(application.userId) ?? null,
                        })
                    );

                    return {
                        ...application,
                        response: application.response as Record<string, any>,
                        teamId,
                        teamName,
                        checkIns,
                        // converting date to unix timestamp before returning
                        // suppressing warning to avoid uncessesary type conversion.
                        createdDate: createdDate?.getTime(),
                        members,
                    };
                });

            const hasMoreItem =
                applicationsWithAllInfos.length > input.maxResult;

            const nextToken = hasMoreItem
                ? `${offset + applicationsWithAllInfos.length - 1}`
                : null;

            return {
                applications: hasMoreItem
                    ? applicationsWithAllInfos.slice(0, -1)
                    : applicationsWithAllInfos,
                nextToken,
            };
        }),

    getApplicationCount: adminProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            const [{ applicationCount }] = await databaseClient
                .select({ applicationCount: count(applications.userId) })
                .from(applications)
                .where(eq(applications.hackathonId, input.hackathonId));

            return { applicationCount };
        }),

    updateApplication: protectedProcedure
        .input(updateApplicationStatusSchema)
        .mutation(async ({ input, ctx }) => {
            if (!hasAdminAccess(ctx.user.userRole)) {
                if (ctx.user.id !== input.userId) {
                    throw new TRPCError({ code: 'UNAUTHORIZED' });
                }
                if (
                    input.status !== undefined ||
                    input.pendingStatus !== undefined ||
                    input.flagged !== undefined ||
                    input.hsFlagged !== undefined
                ) {
                    throw new TRPCError({ code: 'UNAUTHORIZED' });
                }
            }

            return applyApplicationStatusUpdate(input);
        }),

    updateApplicationBatch: adminProcedure
        .input(batchUpdateApplicationStatusSchema)
        .mutation(async ({ input }) => {
            const payload: {
                pendingStatus?: StatusEnum;
                currentStatus?: StatusEnum;
                flagged?: boolean;
                hsFlagged?: boolean;
            } = {};
            if (input.pendingStatus !== undefined) {
                payload.pendingStatus = input.pendingStatus;
            }
            if (input.status !== undefined) {
                payload.currentStatus = input.status;
            }
            if (input.flagged !== undefined) {
                payload.flagged = input.flagged;
            }
            if (input.hsFlagged !== undefined) {
                payload.hsFlagged = input.hsFlagged;
            }

            const updatedApplications = await databaseClient
                .update(applications)
                .set(payload)
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        inArray(applications.userId, input.userIds)
                    )
                )
                .returning();

            if (
                updatedApplications.length > 0 &&
                (input.status !== undefined ||
                    input.pendingStatus !== undefined ||
                    input.flagged !== undefined ||
                    input.hsFlagged !== undefined)
            ) {
                void publishReviewTableEvent({
                    hackathonId: input.hackathonId,
                });
            }

            // if (input.status === 'Accepted') {
            //     for (const application of updatedApplications) {
            //         try {
            //             await assignHouseIfNeeded(
            //                 application.hackathonId,
            //                 application.userId
            //             );
            //         } catch (error) {
            //             console.error(
            //                 'House assignment failed after batch status updated to Accepted:',
            //                 error
            //             );
            //         }
            //     }
            // }

            return updatedApplications;
        }),

    getCurrentApplication: protectedProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input, ctx }) => {
            const [application] = await databaseClient
                .select()
                .from(applications)
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        eq(applications.userId, ctx.user.id)
                    )
                )
                .limit(1);

            return application ?? null;
        }),

    getApplicationByEmail: adminProcedure
        .input(
            z.object({
                email: z.string().email(),
            })
        )
        .query(async ({ input }) => {
            return fetchApplicationByEmail(input.email);
        }),

    getApplicationByHackathonAndUserId: adminProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                userId: z.number().int(),
            })
        )
        .query(async ({ input }) => {
            return fetchApplicationByHackathonAndUserId(
                input.hackathonId,
                input.userId
            );
        }),

    getApplicationsByEmail: adminProcedure
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

    updateLastEmailSent: protectedProcedure
        .input(updateLastEmailSentSchema)
        .mutation(async ({ input, ctx }) => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                ctx.user.id !== input.userId
            ) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }

            return applyLastEmailSentUpdate(input);
        }),

    batchUpdateLastEmailSent: adminProcedure
        .input(batchUpdateLastEmailSentSchema)
        .mutation(async ({ input }) => {
            if (input.userIds.length === 0) {
                return [];
            }

            return await databaseClient
                .update(applications)
                .set({
                    lastEmailSent: input.emailType,
                })
                .where(
                    and(
                        eq(applications.hackathonId, input.hackathonId),
                        inArray(applications.userId, input.userIds)
                    )
                )
                .returning();
        }),

    getStatisticsData: adminProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            try {
                const response = await fetch(
                    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/statistics/${input.hackathonId}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            success: false,
                            error: 'Statistics data not found. Please run the cron job first.',
                            data: [],
                        };
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Error fetching statistics data:', error);
                return {
                    success: false,
                    error: 'Failed to fetch statistics data',
                    data: [],
                };
            }
        }),
});

export async function fetchApplicationByEmail(email: string) {
    const [application] = await databaseClient
        .select(getTableColumns(applications))
        .from(applications)
        .innerJoin(user, eq(applications.userId, user.id))
        .where(eq(user.email, email))
        .orderBy(desc(applications.createdDate))
        .limit(1);

    return application as ApplicationInfo;
}

export async function fetchApplicationByHackathonAndUserId(
    hackathonId: number,
    userId: number
) {
    const [application] = await databaseClient
        .select(getTableColumns(applications))
        .from(applications)
        .where(
            and(
                eq(applications.hackathonId, hackathonId),
                eq(applications.userId, userId)
            )
        )
        .limit(1);

    return (application ?? null) as ApplicationInfo | null;
}

export type ApplicationsRouter = typeof applicationsRouter;

export interface ApplicationWithTeamInfo {
    response: Record<string, any>;
    teamId: number | null;
    teamName: string | null;
    hackathonId: number;
    userId: number;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
    flagged: boolean;
    hsFlagged: boolean;
    createdDate: number;
    checkIns: {
        eventId: number;
        eventTitle: string;
        checkedIn: boolean;
        checkInTime: Date | null;
    }[];
    members: string[];
}

export interface ApplicationInfo {
    response: Record<string, any>;
    hackathonId: number;
    userId: number;
    currentStatus: StatusEnum;
    pendingStatus: StatusEnum;
    flagged: boolean;
    hsFlagged: boolean;
    createdDate: Date;
}
