import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 64 }).notNull(),
  lastName: varchar('last_name', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  // We also need to account for the metadata which includes the hashing algorithm, its versions, parameters
  // and the base64 encoded salt used in the hashing process, which is in total 54 characters
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
  id: z.string().min(1),
});

const selectUserSchema = createSelectSchema(users);

export {
  deleteUserSchema,
  insertUserSchema,
  selectUserSchema,
  updateUserSchema,
  users,
};
