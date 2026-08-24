import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { emailQueue, emailTemplates } from '@/db/schema/emails';
import { hackathons } from '@/db/schema/hackathons';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import { getUserData } from '@/server/routers/usersRouter';
import { z } from 'zod';
import {
    and,
    desc,
    eq,
    gte,
    ilike,
    inArray,
    lte,
    or,
    sql,
    type SQL,
} from 'drizzle-orm';
import { hasAdminAccess } from '@/lib/auth/roles';
import {
    processEmailQueue,
    MAX_RETRIES,
} from '@/server/email/processEmailQueue';

async function assertAdmin() {
    const user = await getUserData();
    if (!user) throw new InternalServerError('User not authenticated');
    if (!hasAdminAccess(user.userRole)) {
        throw new UnauthorizedError({
            email: user.email,
            role: user.userRole,
        });
    }
    return user;
}

const num = (value: unknown) => Number(value ?? 0);

const DEFAULT_PAGE_SIZE = 50;

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
            await assertAdmin();

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
        .input(z.object({ hackathonId: z.number().optional() }))
        .query(async ({ input }) => {
            await assertAdmin();

            const [row] = await databaseClient
                .select({
                    pending: sql`count(*) filter (where ${emailQueue.status} = 'pending')`,
                    sent: sql`count(*) filter (where ${emailQueue.status} = 'sent')`,
                    failed: sql`count(*) filter (where ${emailQueue.status} = 'failed')`,
                    total: sql`count(*)`,
                })
                .from(emailQueue)
                .where(
                    input.hackathonId
                        ? eq(emailQueue.hackathonId, input.hackathonId)
                        : undefined
                );

            return {
                pending: num(row?.pending),
                sent: num(row?.sent),
                failed: num(row?.failed),
                total: num(row?.total),
                maxRetries: MAX_RETRIES,
            };
        }),

    // Counts grouped by email category (emailType) + template title, so admins
    // see pending/sent/failed per kind of email rather than only global totals.
    getQueueBreakdown: publicProcedure
        .input(z.object({ hackathonId: z.number().optional() }))
        .query(async ({ input }) => {
            await assertAdmin();

            const rows = await databaseClient
                .select({
                    emailType: emailQueue.emailType,
                    templateTitle: emailTemplates.title,
                    pending: sql`count(*) filter (where ${emailQueue.status} = 'pending')`,
                    sent: sql`count(*) filter (where ${emailQueue.status} = 'sent')`,
                    failed: sql`count(*) filter (where ${emailQueue.status} = 'failed')`,
                    total: sql`count(*)`,
                })
                .from(emailQueue)
                .leftJoin(
                    emailTemplates,
                    eq(emailQueue.templateId, emailTemplates.id)
                )
                .where(
                    input.hackathonId
                        ? eq(emailQueue.hackathonId, input.hackathonId)
                        : undefined
                )
                .groupBy(emailQueue.emailType, emailTemplates.title)
                .orderBy(desc(sql`count(*)`));

            return rows.map((r) => ({
                emailType: r.emailType,
                templateTitle: r.templateTitle,
                pending: num(r.pending),
                sent: num(r.sent),
                failed: num(r.failed),
                total: num(r.total),
            }));
        }),

    getQueueItems: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().optional(),
                status: z.enum(['pending', 'sent', 'failed']).optional(),
                emailType: z.string().optional(),
                templateId: z.number().optional(),
                search: z.string().optional(),
                createdFrom: z.string().optional(),
                createdTo: z.string().optional(),
                sentFrom: z.string().optional(),
                sentTo: z.string().optional(),
                cursor: z.string().optional(),
                limit: z.number().int().min(1).max(200).optional(),
            })
        )
        .query(async ({ input }) => {
            await assertAdmin();

            const filters: SQL[] = [];
            if (input.hackathonId) {
                filters.push(eq(emailQueue.hackathonId, input.hackathonId));
            }
            if (input.status) {
                filters.push(eq(emailQueue.status, input.status));
            }
            if (input.emailType) {
                filters.push(eq(emailQueue.emailType, input.emailType));
            }
            if (input.templateId) {
                filters.push(eq(emailQueue.templateId, input.templateId));
            }
            if (input.search) {
                const term = `%${input.search}%`;
                const clause = or(
                    ilike(emailQueue.email, term),
                    ilike(emailQueue.firstName, term),
                    ilike(emailQueue.lastName, term)
                );
                if (clause) filters.push(clause);
            }
            if (input.createdFrom) {
                filters.push(
                    gte(emailQueue.createdAt, new Date(input.createdFrom))
                );
            }
            if (input.createdTo) {
                filters.push(
                    lte(emailQueue.createdAt, new Date(input.createdTo))
                );
            }
            if (input.sentFrom) {
                filters.push(gte(emailQueue.sentAt, new Date(input.sentFrom)));
            }
            if (input.sentTo) {
                filters.push(lte(emailQueue.sentAt, new Date(input.sentTo)));
            }

            const limit = input.limit ?? DEFAULT_PAGE_SIZE;
            const offset = Number(input.cursor ?? 0);

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
                // id breaks ties: bulk-queued rows share a createdAt, and an
                // unstable order would repeat or skip rows across pages.
                .orderBy(desc(emailQueue.createdAt), desc(emailQueue.id))
                .limit(limit + 1)
                .offset(offset);

            const hasMore = rows.length > limit;
            const items = hasMore ? rows.slice(0, limit) : rows;
            const nextToken = hasMore ? String(offset + limit) : undefined;

            return { items, nextToken };
        }),

    // Reset failed rows back to pending so the next send attempt picks them up.
    retryFailed: publicProcedure
        .input(
            z.object({
                ids: z.array(z.number()).optional(),
                hackathonId: z.number().optional(),
                all: z.boolean().optional(),
            })
        )
        .mutation(async ({ input }) => {
            await assertAdmin();

            const filters: SQL[] = [eq(emailQueue.status, 'failed')];
            if (input.ids && input.ids.length > 0) {
                filters.push(inArray(emailQueue.id, input.ids));
            } else if (input.hackathonId) {
                filters.push(eq(emailQueue.hackathonId, input.hackathonId));
            } else if (!input.all) {
                throw new InternalServerError(
                    'retryFailed requires ids, hackathonId, or all=true'
                );
            }

            const updated = await databaseClient
                .update(emailQueue)
                .set({ status: 'pending', failedCount: 0, errorMessage: null })
                .where(and(...filters))
                .returning({ id: emailQueue.id });

            return { retried: updated.length };
        }),

    // Admin-triggered send that bypasses the cron (uses admin auth, not
    // CRON_SECRET). Respects the hourly quota.
    processQueueNow: publicProcedure
        .input(z.object({ hackathonId: z.number().optional() }))
        .mutation(async ({ input }) => {
            await assertAdmin();
            return await processEmailQueue({
                hackathonId: input.hackathonId,
                respectQuota: true,
            });
        }),

    // Send specific pending rows immediately, ignoring the hourly quota
    // (emergency override, admin-only).
    sendNow: publicProcedure
        .input(z.object({ ids: z.array(z.number()).min(1) }))
        .mutation(async ({ input }) => {
            await assertAdmin();
            return await processEmailQueue({
                ids: input.ids,
                respectQuota: false,
            });
        }),
});

export type EmailQueueRouter = typeof emailQueueRouter;
