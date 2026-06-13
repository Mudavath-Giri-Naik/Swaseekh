/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'dotenv': 'dotenv',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
