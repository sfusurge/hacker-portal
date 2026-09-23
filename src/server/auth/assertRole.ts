import { hasAdminAccess } from '@/lib/auth/roles';
import { getUserData } from '@/server/auth/sessionUser';
import { UnauthorizedError } from '@/server/exceptions';

/** Non-tRPC server callers (webhooks, etc.). Prefer tRPC procedures in routers. */
export async function assertAdmin() {
    const user = await getUserData();
    if (!user || !hasAdminAccess(user.userRole)) {
        throw new UnauthorizedError({
            email: user?.email,
            role: user?.userRole,
        });
    }
    return user;
}
