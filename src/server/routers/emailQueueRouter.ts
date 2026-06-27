import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { emailQueue, emailTemplates } from '@/db/schema/emails';
import { hackathons } from '@/db/schema/hackathons';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import { getUserData } from '@/server/routers/usersRouter';
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';

async function assertAdmin() {
    const user = await getUserData();
    if (!user) throw new InternalServerError('User not authenticated');
    if (user.userRole !== UserRoleEnum.admin) {
        throw new UnauthorizedError({
            email: user.email,
            role: user.userRole,
        });
    }
    return user;
}

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
            await assertAdmin();

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

    getQueueItems: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().optional(),
                status: z.enum(['pending', 'sent', 'failed']).optional(),
            })
        )
        .query(async ({ input }) => {
            await assertAdmin();

            const filters = [];
            if (input.hackathonId) {
                filters.push(eq(emailQueue.hackathonId, input.hackathonId));
            }
            if (input.status) {
                filters.push(eq(emailQueue.status, input.status));
            }

            const rows = await databaseClient
                .select({
                    id: emailQueue.id,
                    email: emailQueue.email,
                    firstName: emailQueue.firstName,
                    lastName: emailQueue.lastName,
                    emailType: emailQueue.emailType,
                    status: emailQueue.status,
                    errorMessage: emailQueue.errorMessage,
                    failedCount: emailQueue.failedCount,
                    createdAt: emailQueue.createdAt,
                    sentAt: emailQueue.sentAt,
                    templateTitle: emailTemplates.title,
                    hackathonName: hackathons.name,
                })
                .from(emailQueue)
                .leftJoin(
                    emailTemplates,
                    eq(emailQueue.templateId, emailTemplates.id)
                )
                .leftJoin(hackathons, eq(emailQueue.hackathonId, hackathons.id))
                .where(filters.length > 0 ? and(...filters) : undefined)
                .orderBy(desc(emailQueue.createdAt));

            return rows;
        }),
});

export type EmailQueueRouter = typeof emailQueueRouter;
