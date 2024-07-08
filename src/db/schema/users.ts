import { mysqlTable, int, text, varchar } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
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

const selectUserSchema = createSelectSchema(users);

export { users, insertUserSchema, selectUserSchema };
