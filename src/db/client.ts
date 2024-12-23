import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// DO NOT PUT process.env in a variable, nextjs does static analysis on process.env

export const databaseClient = drizzle(postgres(process.env.POSTGRES_URL!));
