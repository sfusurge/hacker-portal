import { mysqlTable, int, text, varchar } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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
});
const selectUserSchema = createSelectSchema(users);

export { users, insertUserSchema, selectUserSchema };
