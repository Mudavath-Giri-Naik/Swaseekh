/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
    ],
  },
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
