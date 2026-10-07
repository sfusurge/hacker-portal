import { createCaller } from '@/server/appRouter';
import { vi } from 'vitest';
import { TEST_EMAIL, TEST_FIRST_NAME, TEST_LAST_NAME } from '..';
import { getUserData } from '@/server/auth/sessionUser';

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
    const user = await trpcClient.users.addUser({
        email,
        firstName,
        lastName,
    });

    expect(user).toBeDefined();

    vi.mocked(getUserData).mockResolvedValue({
        id: user!.id,
        name: null,
        displayId: user!.displayId,
        email,
        emailVerified: false,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        userRole,
        phoneNumber: phoneNumber ?? null,
        image: image ?? null,
        lastSeenAnnouncementsAt: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
    });

    return user;
}
