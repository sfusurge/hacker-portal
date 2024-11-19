import { databaseClient } from '@/db/client';
import { sql } from 'drizzle-orm';
import { beforeEach } from 'vitest';

import { type MySqlQueryResult } from 'drizzle-orm/mysql2';
import { E2ETestFixture, SkipDbCleanUp } from '../utils';

interface QueryResult extends MySqlQueryResult<Record<string, string>> {}

beforeEach<SkipDbCleanUp & E2ETestFixture>(
  async ({ skipDbCleanUp, task, e2e }) => {
    if (skipDbCleanUp) {
      console.debug(`Skipped cleaning database for "${task.name}"`);
      return;
    }

    // Clean up database before each test
    await databaseClient.transaction(async (tx) => {
      // https://github.com/drizzle-team/drizzle-orm/issues/661
      // A bug where the return type of execute is reversed of the actual result
      const [rows] = (await tx.execute(
        sql`SHOW TABLES`
      )) as unknown as QueryResult;

      const tables = rows
        .flatMap((row) => Object.values(row))
        .filter((table) => !e2e || table != 'users');

      await tx.execute(sql`SET FOREIGN_KEY_CHECKS=0`);

      await Promise.all(
        tables.map((table) => tx.execute(sql.raw(`TRUNCATE TABLE ${table}`)))
      );

      await tx.execute(sql`SET FOREIGN_KEY_CHECKS=1`);
    });

    console.debug(`Cleaned up database for "${task.name}"`);
  }
);
