/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['x7pvefn5lz1gfty3.public.blob.vercel-storage.com'],
    },
    webpack: (config, { isServer }) => {
        // Handle canvas and other binary dependencies
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;

        // Ignore .node files
        config.module.rules.push({
            test: /\.node$/,
            use: 'ignore-loader',
        });

        // Handle PDF.js worker
        config.resolve.alias['pdfjs-dist/build/pdf.worker.js'] =
            'pdfjs-dist/build/pdf.worker.min.js';

        return config;
    },
};

export default nextConfig;
