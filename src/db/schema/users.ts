import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 64 }).notNull(),
  lastName: varchar('last_name', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
});

const insertUserSchema = createInsertSchema(users, {
  email: (email) => email.email(),
  id: (id) => id.optional(),
});

const updateUserSchema = z.object({
  // always 128 chars -- add constraint
  // id is not 128 characters for some reason, i get 400 when i try to set length to 128
  // id: z.string().length(128),
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

const deleteUserSchema = z.object({
  id: z.number().int().min(0),
});

const selectUserSchema = createSelectSchema(users);

export {
  deleteUserSchema,
  insertUserSchema,
  selectUserSchema,
  updateUserSchema,
  users,
};
