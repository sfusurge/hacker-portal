vi.mock('@/db/schema/users/users', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@/db/schema/users/users')>();

    return {
        ...actual,
        getUserData: vi.fn(),
    };
});
