import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';
import { auth, SessionType } from '@/auth/auth';
import { fetchUserRecordById } from '@/server/routers/usersRouter';

async function getUserDataWithPrivateCache() {
    'use cache: private';
    cacheTag('user-data');
    cacheLife({ stale: 30 });

    const session = (await auth()) as SessionType;

    if (!session || !session.userId) {
        return undefined;
    }

    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
        return undefined;
    }

    return fetchUserRecordById(userId);
}

async function getBasicUserInfoWithPrivateCache() {
    'use cache: private';
    cacheTag('user-basic-info');
    cacheLife({ stale: 30 });

    const session = (await auth()) as SessionType;

    return {
        email: session.user.email.toLowerCase(),
        image: session.user.image ?? '',
        id: parseInt(session.userId),
    };
}

/** Request-scoped user data for Server Components (Cache Components safe). */
export const getCachedUserData = cache(getUserDataWithPrivateCache);

/** JWT-only user info for Server Components (Cache Components safe). */
export const getCachedBasicUserInfo = cache(getBasicUserInfoWithPrivateCache);
