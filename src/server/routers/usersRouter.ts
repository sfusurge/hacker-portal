import { databaseClient } from '@/db/client';
import { publicProcedure, router } from '../trpc';

import {
    deleteUserSchema,
    insertUserSchema,
    updateUserSchema,
    user,
} from '@/db/schema/users/users';
import { eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { UnauthorizedError } from '../exceptions';
import { auth, SessionType } from '@/auth/auth';
import { getSixDigitId, userRNGParams } from '@/lib/PRNG/LCG';

export const usersRouter = router({
    /**
     * get users along with their display id.
     */
    getUsers: publicProcedure.query(async () => {
        const res = await databaseClient
            .select({
                id: user.id,
                email: user.email,
                image: user.image,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                userRole: user.userRole,
                displayId: user.displayId,
            })
            .from(user);
        return res;
    }),

    getJudges: publicProcedure.query(async () => {
        const res = await databaseClient
            .select({
                id: user.id,
                email: user.email,
                image: user.image,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                userRole: user.userRole,
                displayId: user.displayId,
            })
            .from(user)
            .where(eq(user.userRole, 'judge'));
        return res;
    }),

    getUserById: publicProcedure
        .input(z.object({ userId: z.union([z.number(), z.string()]) }))
        .query(async ({ input }) => {
            const userData = await getUserData();

            if (userData?.userRole !== 'admin') {
                throw new UnauthorizedError({
                    email: userData?.email,
                    role: userData?.userRole,
                });
            }

            const [res] = await databaseClient
                .select({
                    id: user.id,
                    email: user.email,
                    image: user.image,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    userRole: user.userRole,
                    displayId: user.displayId,
                })
                .from(user)
                .where(
                    or(
                        eq(user.id, Number(input.userId)),
                        eq(user.displayId, `${input.userId}`)
                    )
                );

            return res;
        }),

    addUser: publicProcedure.input(insertUserSchema).mutation(async (opts) => {
        const res = await addUser(opts.input);
        return res;
    }),
    deleteUser: publicProcedure
        .input(deleteUserSchema)
        .mutation(async (opts) => {
            await databaseClient.delete(user).where(eq(user.id, opts.input.id));
        }),
    updateUser: publicProcedure
        .input(updateUserSchema)
        .mutation(async (opts) => {
            const { id, ...updateValues } = opts.input;
            await databaseClient
                .update(user)
                .set(updateValues)
                .where(eq(user.id, id));
        }),
});

export type UsersRouter = typeof usersRouter;
export interface UserType {
    id: number;
    email: string;
    image?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phoneNumber?: string | undefined;
    userRole: string;
    displayId: string;
}

export async function getUserData() {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return undefined;
    }

    const normalizedEmail = session.user.email.toLowerCase();

    const dbUser = (
        await databaseClient
            .select()
            .from(user)
            .limit(1)
            .where(eq(user.email, normalizedEmail))
    )[0];

    if (!dbUser) {
        return undefined;
    }

    return {
        ...dbUser,
    };
}

/**
 * only returns info contained in user's jwt, without making a db fetch
 */
export async function getBasicUserInfo() {
    const session = (await auth()) as SessionType;
    return {
        email: session.user.email.toLowerCase(),
        image: session.user.image ?? '',
        userId: parseInt(session.userId),
    };
}

export type UserData = Awaited<ReturnType<typeof getUserData>>;

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
