import { getTableColumns, InferSelectModel, sql } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { databaseClient } from '../../client';

import { getSixDigitId, userRNGParams } from '@/lib/PRNG/LCG';

export const UserRoleEnum = {
    user: 'user',
    admin: 'admin',
};

export const userRoleDbEnum = pgEnum('user_role', [
    UserRoleEnum.admin,
    UserRoleEnum.user,
]);

const users = pgTable(
    'users',
    {
        id: integer('id')
            .generatedAlwaysAsIdentity({ startWith: 1 })
            .primaryKey(),
        firstName: varchar('first_name', { length: 64 }),
        lastName: varchar('last_name', { length: 64 }),
        phoneNumber: varchar('phone_number', { length: 15 }),
        email: varchar('email', { length: 255 }).unique().notNull(),
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

const selectUserSchema = createSelectSchema(users); // select a user by either their primary key id or their display id.

const insertUserSchema = createInsertSchema(users, {
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

type UserTableType = InferSelectModel<typeof users>;

export {
    deleteUserSchema,
    insertUserSchema,
    selectUserSchema,
    updateUserSchema,
    users,
};
export type { UserTableType };

export async function addUser(vals: z.infer<typeof insertUserSchema>) {
    // create the user, and catch their id
    const res = await databaseClient.transaction(async (tx) => {
        const [_index] = await tx.execute(
            sql`select (last_value + 1) as "last_value" from users_id_seq`
        );
        const index = parseInt(`${_index['last_value']}`, 10);

        if (isNaN(index)) {
            // update failed.
            console.log(`Insert user failed, index fetch failed: ${index}`);
            console.log(
                await tx.execute(sql`select (last_value + 1) from users_id_seq`)
            );

            return undefined;
        }

        const displayId = getSixDigitId(index, userRNGParams);

        const insertResult = (
            await databaseClient
                .insert(users)
                .values({
                    ...vals,
                    displayId,
                })
                .returning()
        )[0];
        return insertResult;
    });
    return res;
}
