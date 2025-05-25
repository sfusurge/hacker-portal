import { InferSelectModel, sql, eq } from 'drizzle-orm';
import {
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { databaseClient } from '../../client';

import { getSixDigitId, userRNGParams } from '@/lib/PRNG/LCG';

export const UserRoleEnum = {
    user: 'user',
    admin: 'admin',
    judge: 'judge',
};

export const userRoleDbEnum = pgEnum('user_role', [
    UserRoleEnum.admin,
    UserRoleEnum.user,
    UserRoleEnum.judge,
]);

export const user = pgTable(
    'user',
    {
        id: integer('id')
            .generatedByDefaultAsIdentity({ startWith: 1 })
            .primaryKey(),
        name: text('name'), // not used
        firstName: varchar('first_name', { length: 64 }),
        lastName: varchar('last_name', { length: 64 }),
        phoneNumber: varchar('phone_number', { length: 15 }),
        email: varchar('email', { length: 255 }).unique().notNull(),
        emailVerified: timestamp('emailVerified', { mode: 'date' }),
        image: text('image'),
        userRole: userRoleDbEnum('user_role').default('user').notNull(),
        displayId: varchar('display_id', { length: 6 }).notNull().unique(),
    },
    (table) => {
        return [
            index('email_index').on(table.email),
            index('display_id_index').on(table.displayId),
        ];
    }
);

const selectUserSchema = createSelectSchema(user); // select a user by either their primary key id or their display id.

const insertUserSchema = createInsertSchema(user, {
    email: (email) => email.email(),
}).omit({ displayId: true });
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
});

const deleteUserSchema = z.object({
    id: z.number().int(),
});

type UserTableType = InferSelectModel<typeof user>;

export {
    deleteUserSchema,
    insertUserSchema,
    selectUserSchema,
    updateUserSchema,
};
export type { UserTableType };
