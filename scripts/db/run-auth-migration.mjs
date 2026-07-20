import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const connectionString =
    process.env.DBURL ?? 'postgres://root:12345@localhost:5432/portaldb';

const sqlPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    'migrate-nextauth-to-better-auth.sql'
);

const migrationSql = readFileSync(sqlPath, 'utf8');
const sql = postgres(connectionString, {
    max: 1,
    onnotice: () => {},
});

try {
    console.log(`Running auth migration against ${connectionString}`);
    await sql.unsafe(migrationSql);
    console.log('Auth migration completed successfully.');
    console.log('Next step: pnpm drizzle:push');
} catch (error) {
    console.error('Auth migration failed:', error);
    process.exitCode = 1;
} finally {
    await sql.end();
}
