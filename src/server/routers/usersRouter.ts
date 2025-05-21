import { databaseClient } from '@/db/client';
import { publicProcedure, router } from '../trpc';

import {
    addUser,
    deleteUserSchema,
    getUserData,
    insertUserSchema,
    updateUserSchema,
    user,
} from '@/db/schema/users/users';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { UnauthorizedError } from '../exceptions';

export const usersRouter = router({
    /**
     * get users along with their display id.
     */
    getUsers: publicProcedure.query(async () => {
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

    getUserById: publicProcedure
        .input(z.object({ userId: z.union([z.number(), z.string()]) }))
        .query(async ({ input }) => {
            const userData = await getUserData();

            if (userData?.userRole !== 'admin') {
                throw new UnauthorizedError({
                    email: userData?.email,
                    role: userData?.userRole,
                });
            }

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

    addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
        const res = await addUser(opts.input);
        return res;
    }),
    deleteUser: publicProcedure
        .input(deleteUserSchema)
        .mutation(async (opts) => {
            await databaseClient.delete(user).where(eq(user.id, opts.input.id));
        }),
    updateUser: publicProcedure
        .input(updateUserSchema)
        .mutation(async (opts) => {
            const { id, ...updateValues } = opts.input;
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
