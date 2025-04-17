import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';

import {
    insertUserSchema,
    deleteUserSchema,
    updateUserSchema,
    users,
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
                id: users.id,
                email: users.email,
                image: users.image,
                firstName: users.firstName,
                lastName: users.lastName,
                phoneNumber: users.phoneNumber,
                userRole: users.userRole,
                displayId: users.displayId,
            })
            .from(users);
        return res;
    }),
    addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
        const res = await addUser(opts.input);
        return res;
    }),
    deleteUser: publicProcedure
        .input(deleteUserSchema)
        .mutation(async (opts) => {
            await databaseClient
                .delete(users)
                .where(eq(users.id, opts.input.id));
        }),
    updateUser: publicProcedure
        .input(updateUserSchema)
        .mutation(async (opts) => {
            const { id, ...updateValues } = opts.input;
            await databaseClient
                .update(users)
                .set(updateValues)
                .where(eq(users.id, id));
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
