import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const globalForDb = globalThis as unknown as {
    conn: ReturnType<typeof postgres> | undefined;
};

// this weird scheme hopefully lets local dev server hotreloads without making new db connections
let db: ReturnType<typeof postgres> | undefined;
if (process.env.NODE_ENV !== 'production') {
    if (globalForDb.conn) {
        db = globalForDb.conn;
    } else {
        globalForDb.conn = postgres(
            process.env.DBURL ??
                'postgres://root:12345@localhost:5432/portaldb',
            {
                prepare: false,
            }
        );
        db = globalForDb.conn;
    }
} else {
    db = postgres(
        process.env.DBURL ?? 'postgres://root:12345@localhost:5432/portaldb',
        {
            prepare: false,
        }
    );
}

export const databaseClient = drizzle(db!);
