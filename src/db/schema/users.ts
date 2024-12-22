import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 64 }).notNull(),
  lastName: varchar('last_name', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
});

const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  id: (schema) => schema.id.optional(),
});

const updateUserSchema = z.object({
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
