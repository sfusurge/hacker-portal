import {
  pgTable,
  integer,
  serial,
  text,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { hashPassword } from '../utils';
export const userTable = pgTable('users', {
  id: serial('id').primaryKey(),
  first_name: varchar('first_name', {
    length: 64,
  }).notNull(),

  last_name: varchar('last_name', {
    length: 64,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  }).notNull(),

  password: varchar('password', {
    length: 128, // to store hashed password
  }).notNull(),
  last_login: timestamp('last_login', {}).notNull().defaultNow(),
});

const deleteUser = z.object({
  id: z.number().min(0),
});
const getUsers = createSelectSchema(userTable);

const insertUser = createInsertSchema(userTable, {
  email: (schema) => schema.email.email(),
})
  .omit({ id: true })
  .transform(async (input) => {
    input.password = await hashPassword(input.password);
    return input;
  });

const updateUser = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
});

export const commentTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  user_id: integer('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  created_time: timestamp('create_time').notNull().defaultNow(),
});

const getComments = createSelectSchema(commentTable);
const insertComment = createInsertSchema(commentTable).omit({ id: true });
const updateComment = z.object({
  id: z.number(),
  message: z.string(),
});
const deleteComment = z.object({
  id: z.number().min(0),
});

export const simpleCommentTable = pgTable('simpleComments', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  userName: varchar('userName').notNull().default(''),
  message: text('message').notNull().default(''),
});

const insertSimpleComment = createInsertSchema(simpleCommentTable).omit({
  id: true,
});

export const mostRecentCommentTable = pgTable('mostRecentComment', {
  id: serial('id').primaryKey(),
  userName: varchar('userName').notNull().default(''),
  message: text('message').notNull().default(''),
});

export {
  getComments,
  insertComment,
  updateComment,
  deleteComment,
  getUsers,
  insertUser,
  updateUser,
  deleteUser,
  insertSimpleComment,
};
