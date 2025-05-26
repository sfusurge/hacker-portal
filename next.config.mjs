/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'x7pvefn5lz1gfty3.public.blob.vercel-storage.com',
                port: '',
            },
        ],
    },
};

export default nextConfig;
