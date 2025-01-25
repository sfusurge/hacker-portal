import { defineWorkspace } from 'vitest/config';

const workspace = defineWorkspace([
    {
        extends: 'vitest.config.ts',
        test: {
            name: 'unit',
            dir: 'test/unit',
            // https://vitest.dev/config/#globalsetup
            globalSetup: ['./test/setup/localDB.ts'],
            // https://vitest.dev/config/#setupfiles
            setupFiles: ['./test/setup/truncateDatabase.ts'],
        },
    },
    {
        extends: 'vitest.config.ts',
        test: {
            name: 'e2e',
            dir: 'test/e2e',
            // https://vitest.dev/config/#globalsetup
            globalSetup: ['./test/setup/localDB.ts'],
            // https://vitest.dev/config/#setupfiles
            setupFiles: ['./test/setup/truncateDatabase.ts'],
        },
    },
]);

export default workspace;
