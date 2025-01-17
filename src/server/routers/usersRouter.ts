import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { userDisplayIds } from '@/db/schema/userDisplayId';
import {
  insertUserSchema,
  deleteUserSchema,
  updateUserSchema,
  users,
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
    // create the user, and catch their id
    console.log('A');

    const res = await databaseClient
      .insert(users)
      .values({
        ...opts.input,
      })
      .returning({ userId: users.id });
    console.log('B');

    if (res.length !== 1) {
      return; // insertion has failed if no return
    }
    console.log('C', getSixDigitId(res[0].userId), res[0].userId);

    // create display id
    await databaseClient.insert(userDisplayIds).values({
      userId: res[0].userId,
      displayId: getSixDigitId(res[0].userId),
    });
    console.log('D');
  }),
  deleteUser: publicProcedure.input(deleteUserSchema).mutation(async (opts) => {
    await databaseClient.delete(users).where(eq(users.id, opts.input.id));
  }),
  updateUser: publicProcedure.input(updateUserSchema).mutation(async (opts) => {
    const { id, ...updateValues } = opts.input;

    await databaseClient
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id));
  }),
});

export type usersRouter = typeof usersRouter;
