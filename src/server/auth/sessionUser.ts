import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import { getSession, SessionType } from '@/auth/auth';

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

/** JWT-only user info (no DB fetch). */
export async function getBasicUserInfo() {
    const session = (await getSession()) as SessionType;
    return {
        email: session.user.email.toLowerCase(),
        image: session.user.image ?? '',
        id: parseInt(session.userId),
    };
}

export type UserData = Awaited<ReturnType<typeof getUserData>>;
