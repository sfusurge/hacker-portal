import { adminProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import {
    emailTemplates,
    emailTemplateStyling,
    emailTemplateSchema,
    getEmailTemplateSchema,
    deleteEmailTemplateSchema,
} from '@/db/schema/emails';
import { hackathonEmailTypeEnum } from '@/db/schema/emails';
import { applications } from '@/db/schema/applications';
import { hackathons } from '@/db/schema/hackathons';
import { eq, desc, and, getTableColumns } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { hasAdminAccess } from '@/lib/auth/roles';
export const emailTemplatesRouter = router({
    createEmailTemplate: adminProcedure
        .input(emailTemplateSchema)
        .mutation(async ({ input }) => {
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

    getEmailTemplates: adminProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
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

    getEmailTemplate: adminProcedure
        .input(getEmailTemplateSchema)
        .query(async ({ input }) => {
            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(eq(emailTemplates.id, input.id))
                .limit(1);

            return template || null;
        }),

    getEmailTemplateByName: adminProcedure
        .input(z.object({ title: z.string() }))
        .query(async ({ input }) => {
            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(eq(emailTemplates.title, input.title))
                .limit(1);

            return template || null;
        }),

    getEmailTemplateByPurpose: adminProcedure
        .input(z.object({ purpose: z.string() }))
        .query(async ({ input }) => {
            const [template] = await databaseClient
                .select()
                .from(emailTemplates)
                .where(eq(emailTemplates.purpose, input.purpose))
                .limit(1);

            return template || null;
        }),

    getEmailTemplateByHackathonAndType: protectedProcedure
        .input(
            z.object({
                hackathonId: z.number().int(),
                emailType: z.enum(hackathonEmailTypeEnum.enumValues),
            })
        )
        .query(async ({ input, ctx }) => {
            if (
                !hasAdminAccess(ctx.user.userRole) &&
                input.emailType !== 'rsvp_received'
            ) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }
            if (!hasAdminAccess(ctx.user.userRole)) {
                const [application] = await databaseClient
                    .select({ currentStatus: applications.currentStatus })
                    .from(applications)
                    .where(
                        and(
                            eq(applications.hackathonId, input.hackathonId),
                            eq(applications.userId, ctx.user.id)
                        )
                    )
                    .limit(1);
                if (
                    !application ||
                    application.currentStatus !== 'Accepted - RSVP to Confirm'
                ) {
                    throw new TRPCError({ code: 'FORBIDDEN' });
                }
            }
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
    getRsvpPaymentConfirmationTemplate: adminProcedure
        .input(z.object({ hackathonId: z.number().int() }))
        .query(async ({ input }) => {
            return fetchRsvpPaymentConfirmationTemplate(input.hackathonId);
        }),

    updateEmailTemplate: adminProcedure
        .input(emailTemplateSchema.extend({ id: z.number().int() }))
        .mutation(async ({ input }) => {
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

    deleteEmailTemplate: adminProcedure
        .input(deleteEmailTemplateSchema)
        .mutation(async ({ input }) => {
            return await databaseClient
                .delete(emailTemplates)
                .where(eq(emailTemplates.id, input.id));
        }),
});

export async function fetchRsvpPaymentConfirmationTemplate(
    hackathonId: number
) {
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
}
