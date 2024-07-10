import { mysqlTable, int, text, varchar } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import argon2 from "argon2";

const users = mysqlTable("users", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  first_name: varchar("first_name", { length: 64 }).notNull(),
  last_name: varchar("last_name", { length: 64 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

const hashPassword = async (password: string) => {
  try {
    return await argon2.hash(password);
  } catch (err) {
    throw new Error("Hashing internal failure");
  }
};

const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  id: (schema) => schema.id.optional(),
}).omit({ id: true }).transform(async (input) => {
  input.password = await argon2.hash(input.password);
  return input;
});

const updateUserSchema = z.object({
  // always 128 chars -- add constraint
  // id is not 128 characters for some reason, i get 400 when i try to set length to 128
  // id: z.string().length(128),
  id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
});

const deleteUserSchema = z.object({
  id: z.string().min(1),
})

const selectUserSchema = createSelectSchema(users);

export { users, insertUserSchema, selectUserSchema, deleteUserSchema, updateUserSchema };
