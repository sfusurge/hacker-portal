import { mysqlTable, int, text, varchar } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const users = mysqlTable("users", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  first_name: varchar("first_name", { length: 64 }).notNull(),
  last_name: varchar("last_name", { length: 64 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
});

const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  id: (schema) => schema.email.optional(),
}).omit({ id: true });

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
