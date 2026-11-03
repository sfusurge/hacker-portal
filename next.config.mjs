import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Gives `next dev` access to the bindings in wrangler.jsonc (ASSETS, caches, ...).
initOpenNextCloudflareForDev();

// Set by scripts/cf-build.mjs. Only the Worker build needs the Ably workaround
// below; Netlify keeps the official Node build.
const isCloudflareBuild = process.env.CLOUDFLARE_BUILD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cache Components is disabled because the OpenNext Cloudflare adapter
    // cannot run its staged renders on Workers yet: every request 500s and the
    // worker hangs (opennextjs/opennextjs-cloudflare#1450, #1318). Re-enable it
    // (and the 'use cache' directives) once that fix ships.
    cacheComponents: false,
    // Bake the production flag into the server bundle. Netlify sets it at build time.
    env: {
        MAINTENANCE: process.env.MAINTENANCE ?? '',
    },
    typescript: { ignoreBuildErrors: true },
    skipTrailingSlashRedirect: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'x7pvefn5lz1gfty3.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
            },
            {
                protocol: 'https',
                hostname: 'media.discordapp.net',
            },
        ],
    },
    // Ably's Node bundle embeds a Buffer helper that builds functions with
    // `new Function`, which Workers forbid ("Code generation from strings
    // disallowed"). Point `ably` at the prebuilt browser bundle instead; it
    // drives the same REST/WebSocket endpoints without eval.
    ...(isCloudflareBuild
        ? {
              turbopack: {
                  resolveAlias: {
                      ably: './node_modules/ably/build/ably.js',
                  },
              },
          }
        : {}),
    async headers() {
        return [
            {
                source: '/sponsor/:path*',
                headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
            },
        ];
    },
};

export default nextConfig;
