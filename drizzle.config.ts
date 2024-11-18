import { defineConfig } from 'drizzle-kit';

const env = process.env;

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  verbose: true,
});
