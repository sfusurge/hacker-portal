import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { hashPassword } from '../utils';

const users = pgTable('users', {
  id: uuid('id').primaryKey(),

  firstName: varchar('first_name', { length: 64 }).notNull(),
  lastName: varchar('last_name', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  // According to the documentation "The hash length is the length of the hash function output in bytes.
  // Note that the resulting hash is encoded with Base 64, so the digest will be ~1/3 longer
  // The default value is 32, which produces raw hashes of 32 bytes or digests of 43 characters."
  //
  // We also need to account for the metadata which includes the hashing algorithm, its versions, parameters
  // and the base64 encoded salt used in the hashing process, which is in total 54 characters
  password: varchar('password', { length: 54 + 43 }).notNull(),
});

const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  id: (schema) => schema.id.optional(),
})
  .omit({ id: true })
  .transform(async (input) => {
    input.password = await hashPassword(input.password);
    return input;
  });

const updateUserSchema = z
  .object({
    // always 128 chars -- add constraint
    // id is not 128 characters for some reason, i get 400 when i try to set length to 128
    // id: z.string().length(128),
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
  })
  .transform(async (input) => {
    if (typeof input.password === 'undefined') {
      throw new Error('Password must be defined when updating user details');
    }
    input.password = await hashPassword(input.password);
    return input;
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
