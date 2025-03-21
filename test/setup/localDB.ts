import { databaseClient, db } from '@/db/client';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';

const { pushSchema } = await vi.hoisted(async () => {
    const { exec } =
        await vi.importActual<typeof import('child_process')>('child_process');

    const { resolve } = await vi.importActual<typeof import('path')>('path');

    const { promisify } = await vi.importActual<typeof import('util')>('util');

    const execPromise = promisify(exec);

    const drizzleKit = resolve('./node_modules/.bin/drizzle-kit');

    const crypto = await vi.importActual<typeof import('crypto')>('crypto');

    const pushSchema = async () => {
        const dbFolder = `vitest-db/test-${crypto.randomBytes(8).toString('hex')}`;

        const command = `${drizzleKit} push --schema "./src/db/schema/*" --dialect postgresql --driver pglite --url ${dbFolder}`;

        try {
            console.log(`Running ${command}`);
            const output = await execPromise(command);
            console.log(`stdout: ${output.stdout || 'no stdout'}`);
            console.log(`stderr: ${output.stderr || 'no stderr'}`);
        } catch (e) {
            console.error(e);
            throw e;
        }

        return dbFolder;
    };

    return { pushSchema };
});

vi.mock('@/db/client', async () => {
    const { PGlite } = await vi.importActual<
        typeof import('@electric-sql/pglite')
    >('@electric-sql/pglite');

    const { drizzle } =
        await vi.importActual<typeof import('drizzle-orm/pglite')>(
            'drizzle-orm/pglite'
        );

    const dbFolder = await pushSchema();

    const db = new PGlite(dbFolder);

    const databaseClient = drizzle(db);

    return {
        db,
        databaseClient,
    };
});

beforeEach(async () => {
    // clean db data for each test
    await databaseClient.transaction(async (tx) => {
        const result = (await tx.execute(
            sql`SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
        )) as Record<string, any>;

        const rows = result.rows;

        const tables = rows
            .map((row: Record<string, any>) => row['table_name'])
            ?.join(', ');

        console.debug('truncating tables', tables);

        await tx.execute(sql.raw(`TRUNCATE TABLE ${tables}`));
    });
});

afterAll(async () => {
    // cast to PGlite
    await (db as unknown as PGlite).close();
    console.log('Closed database connection successfully');
});
