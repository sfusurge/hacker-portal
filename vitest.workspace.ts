import path from 'path';
import { defineWorkspace } from 'vitest/config';

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
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
    },
]);

export default workspace;
