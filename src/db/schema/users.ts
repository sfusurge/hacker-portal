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
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  displayId: varchar('display_id', { length: 6 }).notNull().unique(),
  firstName: varchar('first_name', { length: 64 }),
  lastName: varchar('last_name', { length: 64 }),
  phoneNumber: varchar('phone_number', { length: 15 }),
  email: varchar('email', { length: 255 }).unique(),
  isRegistered: boolean('is_registered').default(false).notNull(),
  provider: varchar('provider', { length: 32 }).notNull(),
});

const selectUserSchema = createSelectSchema(users);

const insertUserSchema = createInsertSchema(users, {
  email: (email) => email.email(),
}).extend({});

const updateUserSchema = createUpdateSchema(users);

const deleteUserSchema = z.union([
  z.object({
    id: z.number().int(),
  }),
  z.object({
    displayId: z.string().length(6),
  }),
]);

export {
  deleteUserSchema,
  insertUserSchema,
  selectUserSchema,
  updateUserSchema,
  users,
};
