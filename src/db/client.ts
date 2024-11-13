import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const env = process.env;
const pool = mysql.createPool({
  host: env.DATABASE_HOST || '127.0.0.1',
  port: Number(env.DATABASE_PORT) || 3306,
  user: env.DATABASE_USER || 'root',
  password: env.DATABASE_PASSWORD || '12345',
  database: env.DATABASE_NAME || 'portaldb',
  waitForConnections: true,

  // TODO: add connectionLimit and queueLimit parameters in env
});

export const databaseClient = drizzle(pool);
