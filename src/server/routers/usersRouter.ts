import { databaseClient } from '@/db/client';
import { publicProcedure, router } from '../trpc';

import {
    deleteUserSchema,
    insertUserSchema,
    updateUserSchema,
    user,
} from '@/db/schema/users/users';
import { eq, max, or } from 'drizzle-orm';
import { z } from 'zod';
import { UnauthorizedError } from '../exceptions';
import { getSession, SessionType } from '@/auth/auth';
import { getSixDigitId, userRNGParams } from '@/lib/PRNG/LCG';

export async function fetchUserRecordById(userId: number) {
    const dbUser = (
        await databaseClient
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1)
    )[0];

    if (!dbUser) {
        return undefined;
    }

    return {
        ...dbUser,
    };
}

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
    const session = (await getSession()) as SessionType;

    if (!session || !session.userId) {
        return undefined;
    }

    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
        return undefined;
    }

    return fetchUserRecordById(userId);
}

/**
 * only returns info contained in user's jwt, without making a db fetch
 */
export async function getBasicUserInfo() {
    const session = (await getSession()) as SessionType;
    return {
        email: session.user.email.toLowerCase(),
        image: session.user.image ?? '',
        id: parseInt(session.userId),
    };
}

export type UserData = Awaited<ReturnType<typeof getUserData>>;

export async function addUser(vals: z.infer<typeof insertUserSchema>) {
    // create the user, and catch their id
    const res = await databaseClient.transaction(async (tx) => {
        const [row] = await tx.select({ nextId: max(user.id) }).from(user);
        const index = (row?.nextId ?? 0) + 1;
        console.log('creating user at index: ', index);

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
