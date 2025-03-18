import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        fileParallelism: true,
        silent: true,
        // 15 seconds
        testTimeout: 15_000,
        // To fix next-auth 5 importing issue
        // https://github.com/vitest-dev/vitest/issues/4554
        server: {
            deps: {
                inline: ['next-auth'],
            },
        },
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
    },
    // https://github.com/vitest-dev/vitest/discussions/3042
    resolve: {
        alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
    },
});
