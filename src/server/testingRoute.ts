import { publicProcedure, router } from '@/server/trpc';
import {
  userTable,
  commentTable,
  insertUser,
  deleteUser,
  updateUser,
  getComments,
  insertComment,
} from '@/db/schema/user';
import { db } from '@/db/client';
import { eq } from 'drizzle-orm';

export const testingRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await db.select().from(userTable);
  }),
  addUser: publicProcedure.input(insertUser).mutation(async (opts) => {
    await db.insert(userTable).values({
      ...opts.input,
    });
  }),
  updateUser: publicProcedure.input(updateUser).mutation(async (opts) => {
    await db.update(userTable).set(opts.input);
  }),

  deleteUser: publicProcedure.input(deleteUser).mutation(async (opt) => {
    await db.delete(userTable).where(eq(userTable.id, opt.input.id));
  }),

  getComments: publicProcedure.query(async () => {
    return await db.select().from(commentTable);
  }),

  insertComment: publicProcedure.input(insertComment).mutation(async (opts) => {
    await db.insert(commentTable).values(opts.input);
  }),
});
