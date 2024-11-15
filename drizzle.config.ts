import { defineConfig } from 'drizzle-kit';

const env = process.env;

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: env.DATABASE_HOST || '127.0.0.1',
    port: Number(env.DATABASE_PORT) || 3306,
    user: env.DATABASE_USER || 'root',
    password: env.DATABASE_PASSWORD || '12345',
    database: env.DATABASE_NAME || 'portaldb',
  },
  verbose: true,
});
