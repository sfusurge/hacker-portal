import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
    test: {
        setupFiles: [], // Skip the default database setup
        alias: {
            '@': path.resolve(__dirname, '../../src'),
        },
        env: {
            R2_ENDPOINT: process.env.R2_ENDPOINT!,
            R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
            R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
        },
    },
});
