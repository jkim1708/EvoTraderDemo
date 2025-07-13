/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config, { dev, isServer }) {
        if (!dev && !isServer) {
            config.devtool = 'source-map'; // erzwinge Source Maps im Client-Prod-Build
        }
        return config;
    },
};

export default nextConfig;
