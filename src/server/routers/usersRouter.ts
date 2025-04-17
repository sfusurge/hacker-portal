import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';

import {
    insertUserSchema,
    deleteUserSchema,
    updateUserSchema,
    user,
    addUser,
} from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';

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
