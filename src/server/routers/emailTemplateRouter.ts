import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import {
    emailTemplates,
    emailTemplateSchema,
    getEmailTemplateSchema,
    deleteEmailTemplateSchema,
} from '@/db/schema/emails';
import { eq, desc } from 'drizzle-orm';
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

            const attachmentsWithCropData =
                input.attachments?.map((attachment) => {
                    console.log(
                        'Attachment with cropData:',
                        JSON.stringify(attachment)
                    );
                    return {
                        key: attachment.key,
                        fileName: attachment.fileName,
                        cropData: attachment.cropData,
                    };
                }) || null;

            const [template] = await databaseClient
                .insert(emailTemplates)
                .values({
                    title: input.title,
                    purpose: input.purpose,
                    description: input.description || null,
                    stylingId: input.stylingId ?? null,
                    content: input.content,
                    attachments: attachmentsWithCropData,
                })
                .returning();

            return template;
        }),

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

            // Ensure attachments with cropData are properly preserved
            const attachmentsWithCropData =
                input.attachments?.map((attachment) => {
                    console.log(
                        'Update attachment with cropData:',
                        JSON.stringify(attachment)
                    );
                    return {
                        key: attachment.key,
                        fileName: attachment.fileName,
                        cropData: attachment.cropData,
                    };
                }) || null;

            const [template] = await databaseClient
                .update(emailTemplates)
                .set({
                    title: input.title,
                    purpose: input.purpose,
                    description: input.description || null,
                    stylingId: input.stylingId ?? null,
                    content: input.content,
                    attachments: attachmentsWithCropData,
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
