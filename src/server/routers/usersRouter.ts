import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { userDisplayIds } from '@/db/schema/userDisplayId';
import {
    insertUserSchema,
    deleteUserSchema,
    updateUserSchema,
    users,
    addUser,
} from '@/db/schema/users';
import { getSixDigitId } from '@/lib/PRNG/LCG';
import { eq } from 'drizzle-orm';

export const usersRouter = router({
    getUsers: publicProcedure.query(async () => {
        // get users along with their display id.
        return (
            await databaseClient
                .select()
                .from(users)
                .innerJoin(userDisplayIds, eq(users.id, userDisplayIds.userId))
        ).map((item) => {
            return {
                ...item.users,
                ...item.user_display_id,
            };
        });
    }),
    addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
        await addUser(opts.input);
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
