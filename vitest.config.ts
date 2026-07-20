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
    },
    // https://github.com/vitest-dev/vitest/discussions/3042
    resolve: {
        alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
    },
});
