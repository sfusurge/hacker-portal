import { boolean, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const providersEnum = pgEnum('provider', ['google', 'github', 'email']);
const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 64 }),
  lastName: varchar('last_name', { length: 64 }),
  phoneNumber: varchar('phone_number', { length: 15 }),
  email: varchar('email', { length: 255 }).unique(),
  isRegistered: boolean('is_registered').default(false).notNull(),
  provider: providersEnum().notNull(),
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
