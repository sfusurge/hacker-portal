import { databaseClient } from '@/db/client';
import { sql } from 'drizzle-orm';
import { beforeEach } from 'vitest';

import { E2ETestFixture, SkipDbCleanUp } from '../utils';

beforeEach<SkipDbCleanUp & E2ETestFixture>(
    async ({ skipDbCleanUp, task, e2e }) => {
        if (skipDbCleanUp) {
            console.debug(`Skipped cleaning database for "${task.name}"`);
            return;
        }

        // Clean up database before each test
        await databaseClient.transaction(async (tx) => {
            const rows = await tx.execute(
                sql`SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
            );

            const tables = rows
                .map((row) => row['table_name'])
                // For e2e tests don't delete users table
                .filter((table) => !e2e || table != 'users')
                .join(', ');

            console.debug('truncating tables', tables);

            await tx.execute(sql.raw(`TRUNCATE TABLE ${tables}`));
        });

        console.debug(`Cleaned up database for "${task.name}"`);
    }
);
