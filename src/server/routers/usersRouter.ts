import { publicProcedure, router } from "../trpc";
import { databaseClient } from "@/db/client";
import { insertUserSchema, deleteUserSchema, updateUserSchema, users } from "@/db/schema/users";
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
  updateUser: publicProcedure.input(updateUserSchema).mutation(async (opts) => {
    const {id, ...updateValues} = opts.input;
    await databaseClient.update(users).set(updateValues).where(eq(users.id, id));
  })

});

export type usersRouter = typeof usersRouter;