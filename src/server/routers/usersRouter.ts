import { publicProcedure, router } from "../trpc";
import { databaseClient } from "@/db/client";

import { insertUserSchema, deleteUserSchema, users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const usersRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await databaseClient.select().from(users);
  }),
  addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
    await databaseClient.insert(users).values({
      ...opts.input,
    });
  }),
  deleteUser: publicProcedure.input(deleteUserSchema).mutation(async (opts) => {
    await databaseClient.delete(users).where(eq(users.id, opts.input.id));
  }),
});

export type usersRouter = typeof usersRouter;