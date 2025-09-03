import { publicProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { UserRoleEnum } from '@/db/schema/users/users';
import { UnauthorizedError, InternalServerError } from '../exceptions';
import { emails } from '@/db/schema/emails';
import { desc } from 'drizzle-orm';
import { getUserData } from '@/server/routers/usersRouter';

export const emailsRouter = router({
    getEmails: publicProcedure.query(async () => {
        const user = await getUserData();
        if (!user) throw new InternalServerError('User not authenticated');
        if (user.userRole !== UserRoleEnum.admin) {
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
