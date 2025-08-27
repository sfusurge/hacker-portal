/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['x7pvefn5lz1gfty3.public.blob.vercel-storage.com'],
    },
};

export default nextConfig;
