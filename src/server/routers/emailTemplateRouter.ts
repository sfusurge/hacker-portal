import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { getUserData, UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import {
    emailTemplates,
    emailTemplateSchema,
    getEmailTemplateSchema,
    deleteEmailTemplateSchema,
} from '@/db/schema/emails';
import { eq } from 'drizzle-orm';

export const emailsRouter = router({
    // Create a new email template
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
                    content: input.content,
                })
                .returning();

            return template;
        }),

    // Get all email templates
    getEmailTemplates: publicProcedure.query(async () => {
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
            .select()
            .from(emailTemplates)
            .orderBy(emailTemplates.updatedAt);

        return templates;
    }),

    // Get a specific email template by ID
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

    // Get email template by name
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

    // Update an existing email template
    updateEmailTemplate: publicProcedure
        .input(emailTemplateSchema.extend({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            const user = await getUserData();

            // Only admin can update templates
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
                    content: input.content,
                    updatedAt: new Date(),
                })
                .where(eq(emailTemplates.id, input.id))
                .returning();

            return template;
        }),

    // Delete an email template
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
