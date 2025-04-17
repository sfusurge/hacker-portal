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
import { auth } from '@/auth/auth';

export const UserRoleEnum = {
    user: 'user',
    admin: 'admin',
};

export const userRoleDbEnum = pgEnum('user_role', [
    UserRoleEnum.admin,
    UserRoleEnum.user,
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

export async function addUser(vals: z.infer<typeof insertUserSchema>) {
    // create the user, and catch their id
    const res = await databaseClient.transaction(async (tx) => {
        const [_index] = await tx.execute(
            sql`select (last_value + 1) as "last_value" from user_id_seq`
        );
        const index = parseInt(`${_index['last_value']}`, 10);
        console.log('creating user at index: ', index);

        if (isNaN(index)) {
            // update failed.
            console.log(`Insert user failed, index fetch failed: ${index}`);
            console.log(
                await tx.execute(sql`select (last_value + 1) from user_id_seq`)
            );

            return undefined;
        }

        const displayId = getSixDigitId(index, userRNGParams);

        const [insertResult] = await tx
            .insert(user)
            .values({
                ...vals,
                displayId,
            })
            .returning();

        return insertResult;
    });
    return res;
}

export async function getUserData() {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return undefined;
    }

    const dbUser = (
        await databaseClient
            .select()
            .from(user)
            .limit(1)
            .where(eq(user.email, session.user?.email))
    )[0];

    if (!dbUser) {
        return undefined;
    }

    return {
        ...dbUser,
        image: session.user.image,
    };
}
export type UserData = Awaited<ReturnType<typeof getUserData>>;
