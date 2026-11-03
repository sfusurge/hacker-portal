// Builds the Next.js app and adapts it for Cloudflare Workers.
//
// Sets CLOUDFLARE_BUILD=1 so next.config.mjs can target the Worker runtime
// (see the `ably` alias there). Keeping the flag in this script instead of the
// npm script means `cf:build` behaves the same on Windows and Linux.
import { spawnSync } from 'node:child_process';

const result = spawnSync(
    'opennextjs-cloudflare',
    ['build', ...process.argv.slice(2)],
    {
        stdio: 'inherit',
        // Windows only runs .cmd shims through a shell.
        shell: process.platform === 'win32',
        env: { ...process.env, CLOUDFLARE_BUILD: '1' },
    }
);

process.exit(result.status ?? 1);
