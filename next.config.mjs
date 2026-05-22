/** @type {import('next').NextConfig} */
function posthogRewrites() {
    return [
        {
            source: '/ingest/static/:path*',
            destination: 'https://us-assets.i.posthog.com/static/:path*',
        },
        {
            source: '/ingest/:path*',
            destination: 'https://us.i.posthog.com/:path*',
        },
    ];
}

const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: {
        ignoreDuringBuilds: true,
    },
    skipTrailingSlashRedirect: true,
    async rewrites() {
        return posthogRewrites();
    },
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
};

export default nextConfig;
