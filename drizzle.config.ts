import { defineConfig } from 'drizzle-kit';

const env = process.env;

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',

  verbose: true,
  entities: {
    roles: {
      provider: 'supabase', // ignore supabase default roles.
    },
  },
});
