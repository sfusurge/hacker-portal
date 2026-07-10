import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import { emails } from '@/db/schema/emails';
import { desc } from 'drizzle-orm';
import { getUserData } from '@/server/routers/usersRouter';
import { hasAdminAccess } from '@/lib/auth/roles';

export const emailsRouter = router({
    getEmails: publicProcedure.query(async () => {
        const user = await getUserData();
        if (!user) throw new InternalServerError('User not authenticated');
        if (!hasAdminAccess(user.userRole)) {
            throw new UnauthorizedError({
                email: user.email,
                role: user.userRole,
            });
        }

        const result = await databaseClient
            .select()
            .from(emails)
            .orderBy(desc(emails.createdAt));

        return result;
    }),
});
