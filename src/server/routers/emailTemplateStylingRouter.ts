import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import {
    emailTemplateStyling,
    emailTemplateStylingSchema,
} from '@/db/schema/emails';
import { eq, desc } from 'drizzle-orm';
import { getUserData } from '@/server/routers/usersRouter';
import { z } from 'zod';

export const emailTemplateStylingRouter = router({
    getList: publicProcedure.query(async () => {
        const user = await getUserData();
        if (!user) {
            throw new InternalServerError('User not authenticated');
        }
        if (user.userRole !== UserRoleEnum.admin) {
            throw new UnauthorizedError({
                email: user.email,
                role: user.userRole,
            });
        }
        const list = await databaseClient
            .select()
            .from(emailTemplateStyling)
            .orderBy(desc(emailTemplateStyling.updatedAt));
        return list;
    }),

    getById: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            const user = await getUserData();
            if (!user) {
                throw new InternalServerError('User not authenticated');
            }
            if (user.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user.email,
                    role: user.userRole,
                });
            }
            const [row] = await databaseClient
                .select()
                .from(emailTemplateStyling)
                .where(eq(emailTemplateStyling.id, input.id))
                .limit(1);
            return row ?? null;
        }),

    create: publicProcedure
        .input(emailTemplateStylingSchema)
        .mutation(async ({ input }) => {
            const user = await getUserData();
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }
            const [created] = await databaseClient
                .insert(emailTemplateStyling)
                .values({
                    name: input.name,
                    html: input.html,
                })
                .returning();
            return created;
        }),

    update: publicProcedure
        .input(emailTemplateStylingSchema.extend({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            const user = await getUserData();
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }
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

    delete: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ input }) => {
            const user = await getUserData();
            if (user?.userRole !== UserRoleEnum.admin) {
                throw new UnauthorizedError({
                    email: user?.email,
                    role: user?.userRole,
                });
            }
            return await databaseClient
                .delete(emailTemplateStyling)
                .where(eq(emailTemplateStyling.id, input.id));
        }),
});
