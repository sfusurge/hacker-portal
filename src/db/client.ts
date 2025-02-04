import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const databaseClient = drizzle(
    postgres(
        process.env.DBURL ?? 'postgres://root:12345@localhost:5432/portaldb'
    )
);
