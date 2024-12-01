/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 500, // Add a delay of 500ms (or any value you prefer)
        poll: 1000, // Set polling interval (useful for file systems with slower updates)
      };
    }
    return config;
  },
};

export default nextConfig;
