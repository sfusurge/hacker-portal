import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { emailQueue } from '@/db/schema/emails';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const emailQueueRouter = router({
    queueBatchEmails: publicProcedure
        .input(
            z.object({
                templateId: z.number(),
                users: z.array(
                    z.object({
                        id: z.number(),
                        email: z.string().email(),
                        firstName: z.string().optional(),
                        lastName: z.string().optional(),
                    })
                ),
                hackathonId: z.number().optional(),
                emailType: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const emailJobs = input.users.map((user) => ({
                userId: user.id,
                templateId: input.templateId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                hackathonId: input.hackathonId,
                emailType: input.emailType,
                status: 'pending' as const,
            }));

            await databaseClient.insert(emailQueue).values(emailJobs);

            return {
                success: true,
                queued: emailJobs.length,
                message: `${emailJobs.length} emails queued for sending`,
            };
        }),

    getQueueStatus: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().optional(),
            })
        )
        .query(async ({ input }) => {
            let query = databaseClient.select().from(emailQueue);

            if (input.hackathonId) {
                query = query.where(
                    eq(emailQueue.hackathonId, input.hackathonId)
                ) as any;
            }

            const allJobs = await query;

            const pending = allJobs.filter(
                (j) => j.status === 'pending'
            ).length;
            const sent = allJobs.filter((j) => j.status === 'sent').length;
            const failed = allJobs.filter((j) => j.status === 'failed').length;

            return { pending, sent, failed, total: allJobs.length };
        }),
});

export type EmailQueueRouter = typeof emailQueueRouter;
