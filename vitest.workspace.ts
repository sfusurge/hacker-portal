import path from 'path';
import { defineWorkspace } from 'vitest/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const workspace = defineWorkspace([
    {
        extends: 'vitest.config.ts',
        test: {
            name: 'unit',
            dir: 'test/unit',
            setupFiles: ['./test/setup/localDB.ts', './test/setup/userData.ts'],
        },
    },
    {
        extends: 'vitest.config.ts',
        test: {
            name: 'e2e',
            dir: 'test/e2e',
            setupFiles: ['./test/setup/localDB.ts'],
        },
    },
    {
        extends: 'vitest.config.ts',
        test: {
            name: 'r2',
            dir: 'test/r2',
            setupFiles: ['./test/setup/localDB.ts'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
            env: {
                R2_ENDPOINT: process.env.R2_ENDPOINT!,
                R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
                R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
                R2_BUCKET_NAME: process.env.R2_BUCKET_NAME!,
            },
        },
    },
]);

export default workspace;
