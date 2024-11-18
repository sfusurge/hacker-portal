import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const env = process.env;

const dbClient = postgres(env.DATABASE_URL!);
export const db = drizzle(dbClient, {});
