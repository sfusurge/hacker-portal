import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const providersEnum = pgEnum('provider', ['google', 'github', 'email']);
const users = pgTable('users', {
  id: integer('id').generatedAlwaysAsIdentity({ startWith: 1 }).primaryKey(),
  firstName: varchar('first_name', { length: 64 }),
  lastName: varchar('last_name', { length: 64 }),
  phoneNumber: varchar('phone_number', { length: 15 }),
  email: varchar('email', { length: 255 }).unique(),
  isRegistered: boolean('is_registered').default(false).notNull(),
  provider: varchar('provider', { length: 32 }).notNull(),
});

const selectUserSchema = createSelectSchema(users); // select a user by either their primary key id or their display id.

const insertUserSchema = createInsertSchema(users, {
  email: (email) => email.email(),
});

// zod createUpdateSchema is busted, using manual zod obj for now
const updateUserSchema = z.object({
  id: z.number().int(),
  firstName: z.string().max(64, 'name too long').optional(),
  lastName: z.string().max(64, 'name too long').optional(),
  phoneNumber: z.string().max(25, 'phone number too long').optional(),
  email: z
    .string()
    .email('not a valid email')
    .max(255, 'email too long')
    .optional(),
  isRegistered: z.boolean().default(false).optional(),
  provider: z.string().max(32, 'provider name too long').optional(),
});

const deleteUserSchema = z.object({
  id: z.number().int(),
});

export {
  deleteUserSchema,
  insertUserSchema,
  selectUserSchema,
  updateUserSchema,
  users,
};
