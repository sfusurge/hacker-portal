import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 64 }).notNull(),
  lastName: varchar('last_name', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
});

const selectUserSchema = createSelectSchema(users);

const insertUserSchema = createInsertSchema(users, {
  email: (email) => email.email(),
  id: (id) => id.optional(),
});

const updateUserSchema = createUpdateSchema(users).extend({
  id: z.string().uuid(),
});

const deleteUserSchema = z
  .object({
    id: z.string().uuid(),
  })
  .required();

export {
  deleteUserSchema,
  insertUserSchema,
  selectUserSchema,
  updateUserSchema,
  users,
};
