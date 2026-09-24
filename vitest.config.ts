import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        fileParallelism: true,
        silent: true,
        // 15 seconds
        testTimeout: 15_000,
        server: {
            deps: {
                inline: ['better-auth'],
            },
        },
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        dangerouslyIgnoreUnhandledErrors: true,
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    dir: 'test/unit',
                    setupFiles: [
                        './test/setup/localDB.ts',
                        './test/setup/userData.ts',
                    ],
                },
            },
            {
                extends: true,
                test: {
                    name: 'e2e',
                    dir: 'test/e2e',
                    setupFiles: ['./test/setup/localDB.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'r2',
                    dir: 'test/r2',
                },
            },
        ],
    },
    // https://github.com/vitest-dev/vitest/discussions/3042
    resolve: {
        alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
    },
});
