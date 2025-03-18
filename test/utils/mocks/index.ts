import { getUserData } from '@/app/(auth)/layout';
import { createCaller } from '@/server/appRouter';
import { vi } from 'vitest';
import { TEST_EMAIL, TEST_FIRST_NAME, TEST_LAST_NAME } from '..';

export async function mockCaller(
    trpcClient: ReturnType<typeof createCaller>,
    {
        email = TEST_EMAIL,
        firstName = TEST_FIRST_NAME,
        lastName = TEST_LAST_NAME,
        userRole = 'user',
        phoneNumber = '123456789',
        image = 'imageurl',
    }: Partial<Awaited<ReturnType<typeof getUserData>>> = {}
) {
    const [user] = await trpcClient.users.addUser({
        email,
        firstName,
        lastName,
    });

    vi.mocked(getUserData).mockResolvedValue({
        id: user.userId,
        displayId: user.displayId,
        email,
        firstName,
        lastName,
        userRole,
        phoneNumber,
        image,
    });

    return user;
}
