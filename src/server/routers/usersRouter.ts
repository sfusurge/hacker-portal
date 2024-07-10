import { publicProcedure, router } from "../trpc";
import { databaseClient } from "@/db/client";
import { eq } from 'drizzle-orm';
import { insertUserSchema, updateUserSchema, users } from "@/db/schema/users";

export const usersRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await databaseClient.select().from(users);
  }),
  addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
    await databaseClient.insert(users).values({
      ...opts.input,
    });
  }),
  updateUser: publicProcedure.input(updateUserSchema).mutation(async (opts) => {
    const {id, ...updateValues} = opts.input;
    await databaseClient.update(users).set(updateValues).where(eq(users.id, id));
  })
});

export type usersRouter = typeof usersRouter;
