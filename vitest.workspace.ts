import { defineWorkspace } from 'vitest/config';

const workspace = defineWorkspace([
    {
        extends: 'vitest.config.ts',
        test: {
            name: 'unit',
            dir: 'test/unit',
            setupFiles: ['./test/setup/localDB.ts'],
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
]);

export default workspace;
