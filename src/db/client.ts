import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const env = process.env;

export const databaseClient = drizzle(
    postgres({
        host: env.DATABASE_HOST || '127.0.0.1',
        port: Number(env.DATABASE_PORT) || 5432,
        user: env.DATABASE_USER || 'root',
        password: env.DATABASE_PASSWORD || '12345',
        database: env.DATABASE_NAME || 'portaldb',
        ssl: true,
        prepare: false,
    })
);
