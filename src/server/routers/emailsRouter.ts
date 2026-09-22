import { adminProcedure, router } from '../trpc';
import { databaseClient } from '@/db/client';
import { emails } from '@/db/schema/emails';
import { desc } from 'drizzle-orm';

export const emailsRouter = router({
    getEmails: adminProcedure.query(async () => {
        const result = await databaseClient
            .select()
            .from(emails)
            .orderBy(desc(emails.createdAt));

        return result;
    }),
});
