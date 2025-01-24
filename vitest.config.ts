import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        fileParallelism: false,
        silent: true,
    },
    // https://github.com/vitest-dev/vitest/discussions/3042
    resolve: {
        alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
    },
});
