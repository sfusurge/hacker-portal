import { cache } from 'react';
import { getSession, SessionType } from '@/auth/auth';
import { fetchUserRecordById } from '@/server/auth/sessionUser';

// TODO: replace cache() with 'use cache: private' (opennextjs/opennextjs-cloudflare#1450)
async function getUserData() {
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

async function getBasicUserInfo() {
    const session = (await getSession()) as SessionType;

    return {
        email: session.user.email.toLowerCase(),
        image: session.user.image ?? '',
        id: parseInt(session.userId),
    };
}

/** Request-scoped user data for Server Components. */
export const getCachedUserData = cache(getUserData);

/** JWT-only user info for Server Components. */
export const getCachedBasicUserInfo = cache(getBasicUserInfo);
