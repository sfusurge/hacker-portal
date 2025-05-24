import { databaseClient } from '@/db/client';
import { publicProcedure, router } from '../trpc';

import {
    insertSubmissionSchema,
    getSubmissionQuestionsSchema,
    submissions,
    submissionStatusEnum,
    SubmissionStatusEnumType,
} from '@/db/schema/submissions';
import { hackathons } from '@/db/schema/hackathons';
import { eq } from 'drizzle-orm';

export interface SubmitSubmissionResponse {
    hackathonId: number;
    userId: number;
    response: Record<string, unknown>;
    createdDate: Date;
    currentStatus: SubmissionStatusEnumType;
}

export interface SubmissionWithTeamInfo {
    id: number;
    hackathonId: number;
    teamId: number;
    response: Record<string, unknown>;
    createdDate: number; // Unix timestamp
    currentStatus: typeof submissionStatusEnum;
    pendingStatus: typeof submissionStatusEnum | null;
    teamName: string | null;
}

export const submissionsRouter = router({
    getSubmissionQuestions: publicProcedure
        .input(getSubmissionQuestionsSchema)
        .query(async ({ input }) => {
            const applicationsWithTeamInfo = await databaseClient
                .select({ submissionQuestions: hackathons.submissionQuestions })
                .from(hackathons)
                .where(eq(hackathons.id, input.hackathonId));

            return applicationsWithTeamInfo[0]?.submissionQuestions || null;
        }),
    submitSubmission: publicProcedure
        .input(insertSubmissionSchema)
        .mutation(async ({ input }): Promise<SubmitSubmissionResponse> => {
            // const teamEmails = await getTeamData(input.teamId)
            const [submission] = await databaseClient
                .insert(submissions)
                .values({
                    teamId: input.teamId,
                    hackathonId: input.hackathonId,
                    response: input.response,
                })
                .onConflictDoNothing({
                    target: [submissions.hackathonId, submissions.teamId],
                })
                .returning();

            // const template = Handlebars.compile(welcomeSparkhacksTemplate)
            // const htmlContent = template({
            //     // firstName: tempDummy(input).name,
            // })
            // for (let i = 0; i < teamEmails.length; i++) {
            //     const oAuthMailOptions = {
            //         from: process.env.SENDINGEMAIL,
            //         to: teamEmails[i].email,
            //         subject: "Your SparkJam Application Has Been Received!",
            //         text: "Your SparkJam Application Has Been Received!",
            //         html: htmlContent,
            //     }
            //     transporter.sendMail(oAuthMailOptions, (error, info) => {
            //         if (error) {
            //             console.error("Error sending email:", error)
            //         } else {
            //             console.log("Email sent:", info.response)
            //         }
            //     })
            // }
            return {
                hackathonId: submission.hackathonId,
                userId: 0, // Optional: change if you track the user
                response: submission.response as Record<string, unknown>,
                createdDate: submission.createdDate,
                currentStatus: submission.currentStatus,
            };
        }),

    // getSubmissions: publicProcedure.input(querySubmissionSchema).query(async ({ input }) => {
    //     const offset = (Number(input.nextToken ?? 1) - 1) * input.maxResult
    //
    //     const hackathonIdMatchCondition = eq(submissions.hackathonId, input.hackathonId)
    //
    //     const condition =
    //         input.teamId != undefined
    //             ? and(hackathonIdMatchCondition, eq(submissions.teamId, input.teamId))
    //             : hackathonIdMatchCondition
    //
    //     const submissionsWithTeamInfo = await databaseClient
    //         .select({
    //             ...getTableColumns(submissions),
    //             teamName: teams.name,
    //         })
    //         .from(submissions)
    //         .leftJoin(teams, eq(submissions.teamId, teams.id))
    //         .where(condition)
    //         .orderBy(asc(submissions.createdDate))
    //         .limit(input.maxResult)
    //         .offset(offset)
    //
    //     // Converting date to unix timestamp before returning
    //     const result = submissionsWithTeamInfo.map((item) => ({
    //         ...item,
    //         createdDate: item.createdDate instanceof Date ? item.createdDate.getTime() : item.createdDate,
    //     }))
    //
    //     return result;
    // }),

    // updateSubmission: publicProcedure
    //     .input(updateSubmission)
    //     .mutation(async ({ input }) => {
    //         const payload: Record<string, any> = {};
    //         if (input.pendingStatus) {
    //             payload['pendingStatus'] = input.pendingStatus;
    //         }
    //
    //         if (input.status) {
    //             payload['currentStatus'] = input.status;
    //         }
    //
    //         if (input.response) {
    //             payload['response'] = input.response;
    //         }
    //
    //         const [application] = await databaseClient
    //             .update(applications)
    //             .set(payload)
    //             .where(
    //                 and(
    //                     eq(applications.hackathonId, input.hackathonId),
    //                     eq(applications.userId, input.userId)
    //                 )
    //             )
    //             .returning();
    //
    //         return application;
    //     }),
});

export type submissionRouter = typeof submissionsRouter;
