import { publicProcedure, router } from "../trpc";
import { databaseClient } from "@/db/client";

import { insertUserSchema, users } from "@/db/schema/users";

export const usersRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await databaseClient.select().from(users);
  }),
  addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
    await databaseClient.insert(users).values({
      ...opts.input,
    });
  }),
});

export type usersRouter = typeof usersRouter;
