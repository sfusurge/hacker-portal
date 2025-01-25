import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { AuthenticationError } from './errors';

export async function validateUser(
    loginEmail: string,
    provider: string
): Promise<boolean | string> {
    const userQueryResult = await databaseClient
        .select()
        .from(users)
        .where(eq(users.email, loginEmail));

    if (userQueryResult.length === 0)
        throw new AuthenticationError({
            name: 'USER_DOES_NOT_EXIST',
            message: 'User Does Not Exist',
        });
    if (userQueryResult[0].provider !== provider)
        throw new AuthenticationError({
            name: 'PROVIDER_MISMATCH',
            message:
                'User attempted to sign-in with a different provider under the same email',
        });
    return true;
}

export async function createOAuthUser(email: string, provider: string) {
    return await databaseClient
        .insert(users)
        .values({ email: email, provider: provider, isRegistered: false });
}
