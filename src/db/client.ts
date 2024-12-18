import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// NOTE: DO NOT, use "const env = process.env", as it does not work for clientside env variables.
// Nextjs statically analyse process.env.foo, assinging it variables messes with that.

// TODO figure out local supabase dev client.

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
export const databaseClient = drizzle(sql);
