import { databaseClient } from '@/db/client';
import { adminProcedure, protectedProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { hasAdminAccess } from '@/lib/auth/roles';

import {
    deleteUserSchema,
    insertUserSchema,
    updateUserSchema,
    user,
} from '@/db/schema/users/users';
import { eq, max, or } from 'drizzle-orm';
import { z } from 'zod';
import { getSixDigitId, userRNGParams } from '@/lib/PRNG/LCG';

export {
    fetchUserRecordById,
    getBasicUserInfo,
    getUserData,
    type UserData,
} from '@/server/auth/sessionUser';

export const usersRouter = router({
    /**
     * get users along with their display id.
     */
    getUsers: adminProcedure.query(async () => {
        const res = await databaseClient
            .select({
                id: user.id,
                email: user.email,
                image: user.image,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                userRole: user.userRole,
                displayId: user.displayId,
            })
            .from(user);
        return res;
    }),

    getJudges: adminProcedure.query(async () => {
        const res = await databaseClient
            .select({
                id: user.id,
                email: user.email,
                image: user.image,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                userRole: user.userRole,
                displayId: user.displayId,
            })
            .from(user)
            .where(eq(user.userRole, 'judge'));
        return res;
    }),

    getUserById: adminProcedure
        .input(z.object({ userId: z.union([z.number(), z.string()]) }))
        .query(async ({ input }) => {
            const [res] = await databaseClient
                .select({
                    id: user.id,
                    email: user.email,
                    image: user.image,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    userRole: user.userRole,
                    displayId: user.displayId,
                })
                .from(user)
                .where(
                    or(
                        eq(user.id, Number(input.userId)),
                        eq(user.displayId, `${input.userId}`)
                    )
                );

            return res;
        }),

    addUser: adminProcedure.input(insertUserSchema).mutation(async (opts) => {
        const res = await addUser(opts.input);
        return res;
    }),
    deleteUser: adminProcedure
        .input(deleteUserSchema)
        .mutation(async (opts) => {
            await databaseClient.delete(user).where(eq(user.id, opts.input.id));
        }),
    updateUser: protectedProcedure
        .input(updateUserSchema)
        .mutation(async ({ input, ctx }) => {
            const { id, ...updateValues } = input;
            if (!hasAdminAccess(ctx.user.userRole) && ctx.user.id !== id) {
                throw new TRPCError({ code: 'UNAUTHORIZED' });
            }
            await databaseClient
                .update(user)
                .set(updateValues)
                .where(eq(user.id, id));
        }),
});

export type UsersRouter = typeof usersRouter;
export interface UserType {
    id: number;
    email: string;
    image?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phoneNumber?: string | undefined;
    userRole: string;
    displayId: string;
}

export async function addUser(vals: z.infer<typeof insertUserSchema>) {
    // create the user, and catch their id
    const res = await databaseClient.transaction(async (tx) => {
        const [row] = await tx.select({ nextId: max(user.id) }).from(user);
        const index = (row?.nextId ?? 0) + 1;
        console.log('creating user at index: ', index);

        const displayId = getSixDigitId(index, userRNGParams);

        const [insertResult] = await tx
            .insert(user)
            .values({
                ...vals,
                displayId,
            })
            .returning();

        return insertResult;
    });
    return res;
}
