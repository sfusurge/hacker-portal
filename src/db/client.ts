import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const env = process.env;
// const pool = mysql.createPool({
// host: env.DATABASE_HOST || '127.0.0.1',
// port: Number(env.DATABASE_PORT) || 3306,
// user: env.DATABASE_USER || 'root',
// password: env.DATABASE_PASSWORD || '12345',
// database: env.DATABASE_NAME || 'portaldb',
// waitForConnections: true,
//
// // TODO: add connectionLimit and queueLimit parameters in env
// });

const pool = new Pool({
  host: env.DATABASE_HOST || '127.0.0.1',
  port: Number(env.DATABASE_PORT) || 5432,
  user: env.DATABASE_USER || 'root',
  password: env.DATABASE_PASSWORD || '12345',
  database: env.DATABASE_NAME || 'portaldb',

  ssl: env.NODE_ENV === 'production',
});

export const databaseClient = drizzle(pool);
