import { adminProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import {
    emailTemplateStyling,
    emailTemplateStylingSchema,
} from '@/db/schema/emails';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

export const emailTemplateStylingRouter = router({
    getList: adminProcedure.query(async () => {
        const list = await databaseClient
            .select()
            .from(emailTemplateStyling)
            .orderBy(desc(emailTemplateStyling.updatedAt));
        return list;
    }),

    getById: adminProcedure
        .input(z.object({ id: z.number().int().nullable() }))
        .query(async ({ input }) => {
            if (input.id == null) {
                return null;
            }
            const [row] = await databaseClient
                .select()
                .from(emailTemplateStyling)
                .where(eq(emailTemplateStyling.id, input.id))
                .limit(1);
            return row ?? null;
        }),

    create: adminProcedure
        .input(emailTemplateStylingSchema)
        .mutation(async ({ input }) => {
            const [created] = await databaseClient
                .insert(emailTemplateStyling)
                .values({
                    name: input.name,
                    html: input.html,
                })
                .returning();
            return created;
        }),

    update: adminProcedure
        .input(emailTemplateStylingSchema.extend({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            const [updated] = await databaseClient
                .update(emailTemplateStyling)
                .set({
                    name: input.name,
                    html: input.html,
                    updatedAt: new Date(),
                })
                .where(eq(emailTemplateStyling.id, input.id))
                .returning();
            return updated;
        }),

    delete: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            return await databaseClient
                .delete(emailTemplateStyling)
                .where(eq(emailTemplateStyling.id, input.id));
        }),
});
