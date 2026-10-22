/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
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
