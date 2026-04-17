import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import {
    emailTemplates,
    emailTemplateStyling,
    emailTemplateSchema,
    getEmailTemplateSchema,
    deleteEmailTemplateSchema,
} from '@/db/schema/emails';
import { hackathonEmailTypeEnum } from '@/db/schema/emails';
import { hackathons } from '@/db/schema/hackathons';
import { eq, desc, and, getTableColumns } from 'drizzle-orm';
import { getUserData } from '@/server/routers/usersRouter';

export const emailTemplatesRouter = router({
    createEmailTemplate: publicProcedure
        .input(emailTemplateSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can create email templates
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            const [template] = await databaseClient
                .insert(emailTemplates)
                .values({
                    title: input.title,
                    purpose: input.purpose,
                    description: input.description || null,
                    stylingId: input.stylingId ?? null,
                    content: input.content,
                    hackathonId: input.hackathonId,
                    emailType: input.emailType ?? null,
                })
                .returning();

            return template;
        }),

    getEmailTemplates: publicProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            // Only admin can view all templates
            if (user.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

            const templates = await databaseClient
                .select({
                    ...getTableColumns(emailTemplates),
                    stylingHtml: emailTemplateStyling.html,
                })
                .from(emailTemplates)
                .leftJoin(
                    emailTemplateStyling,
                    eq(emailTemplates.stylingId, emailTemplateStyling.id)
                )
                .where(eq(emailTemplates.hackathonId, input.hackathonId))
                .orderBy(desc(emailTemplates.updatedAt));

            return templates;
        }),

    getEmailTemplate: publicProcedure
        .input(getEmailTemplateSchema)
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            // Only admin can view templates
            if (user.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }

            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(eq(emailTemplates.id, input.id))
                .limit(1);

            return template || null;
        }),

    getEmailTemplateByName: publicProcedure
        .input(z.object({ title: z.string() }))
        .query(async ({ input }) => {
            const user = await getUserData();

            if (!user) {
                throw new InternalServerError('User not authenticated');
            }

            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(eq(emailTemplates.title, input.title))
                .limit(1);

            return template || null;
        }),

    getEmailTemplateByPurpose: publicProcedure
        .input(z.object({ purpose: z.string() }))
        .query(async ({ input }) => {
            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(eq(emailTemplates.purpose, input.purpose))
                .limit(1);

            return template || null;
        }),

    getEmailTemplateByHackathonAndType: publicProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                emailType: z.enum(hackathonEmailTypeEnum.enumValues),
            })
        )
        .query(async ({ input }) => {
            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(
                    and(
                        eq(emailTemplates.hackathonId, input.hackathonId),
                        eq(emailTemplates.emailType, input.emailType)
                    )
                )
                .limit(1);

            return template || null;
        }),

    /**
     * RSVP payment confirmation email: paid hackathons use `rsvp_paid` if set,
     * else `rsvp_received`; unpaid hackathons use `rsvp_received` only.
     */
    getRsvpPaymentConfirmationTemplate: publicProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            const { hackathonId } = input;

            const [h] = await databaseClient
                .select({ isPaid: hackathons.isPaid })
                .from(hackathons)
                .where(eq(hackathons.id, hackathonId))
                .limit(1);

            if (!h) {
                return null;
            }

            if (!h.isPaid) {
                const [t] = await databaseClient
                    .select()
                    .from(emailTemplates)
                    .where(
                        and(
                            eq(emailTemplates.hackathonId, hackathonId),
                            eq(emailTemplates.emailType, 'rsvp_received')
                        )
                    )
                    .limit(1);
                return t ?? null;
            }

            const [paidTemplate] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(
                    and(
                        eq(emailTemplates.hackathonId, hackathonId),
                        eq(emailTemplates.emailType, 'rsvp_paid')
                    )
                )
                .limit(1);

            if (paidTemplate) {
                return paidTemplate;
            }

            const [fallback] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(
                    and(
                        eq(emailTemplates.hackathonId, hackathonId),
                        eq(emailTemplates.emailType, 'rsvp_received')
                    )
                )
                .limit(1);

            return fallback ?? null;
        }),

    updateEmailTemplate: publicProcedure
        .input(emailTemplateSchema.extend({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            const user = await getUserData();

            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            const [template] = await databaseClient
                .update(emailTemplates)
                .set({
                    title: input.title,
                    purpose: input.purpose,
                    description: input.description || null,
                    stylingId: input.stylingId ?? null,
                    content: input.content,
                    hackathonId: input.hackathonId,
                    emailType: input.emailType ?? null,
                    updatedAt: new Date(),
                })
                .where(eq(emailTemplates.id, input.id))
                .returning();

            return template;
        }),

    deleteEmailTemplate: publicProcedure
        .input(deleteEmailTemplateSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can delete templates
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }

            return await databaseClient
                .delete(emailTemplates)
                .where(eq(emailTemplates.id, input.id));
        }),
});
