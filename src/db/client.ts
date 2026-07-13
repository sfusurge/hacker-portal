import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNeonWs } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import ws from 'ws';

const connectionString =
    process.env.DBURL ?? 'postgres://root:12345@localhost:5432/portaldb';

const isNeon = connectionString.includes('neon.tech');

type DatabaseClient = ReturnType<typeof drizzlePostgresJs>;

const globalForDb = globalThis as unknown as {
    neonSql?: ReturnType<typeof neon>;
    postgresConn?: ReturnType<typeof postgres>;
};

function createDatabaseClient(): DatabaseClient {
    if (isNeon) {
        neonConfig.webSocketConstructor = ws;
        neonConfig.fetchConnectionCache = true;

        if (!globalForDb.neonSql) {
            globalForDb.neonSql = neon(connectionString);
        }

        const httpDb = drizzleNeonHttp(globalForDb.neonSql);

        // neon-http has no interactive transactions; open a short-lived WebSocket
        // pool per transaction so the connection closes when the tx finishes.
        async function runTransaction<T>(
            callback: Parameters<DatabaseClient['transaction']>[0],
            config?: Parameters<DatabaseClient['transaction']>[1]
        ): Promise<T> {
            const pool = new Pool({ connectionString });
            const wsDb = drizzleNeonWs(pool);
            try {
                return (await wsDb.transaction(
                    callback as unknown as Parameters<
                        typeof wsDb.transaction
                    >[0],
                    config
                )) as T;
            } finally {
                await pool.end();
            }
        }

        return new Proxy(httpDb, {
            get(target, prop, receiver) {
                if (prop === 'transaction') {
                    return runTransaction;
                }
                return Reflect.get(target, prop, receiver);
            },
        }) as unknown as DatabaseClient;
    }

    if (!globalForDb.postgresConn) {
        globalForDb.postgresConn = postgres(connectionString, {
            prepare: false,
            max: 1,
        });
    }

    return drizzlePostgresJs(globalForDb.postgresConn);
}

export const databaseClient = createDatabaseClient();

// Underlying driver handle (used by tests / tooling).
export const db = isNeon ? globalForDb.neonSql : globalForDb.postgresConn;
