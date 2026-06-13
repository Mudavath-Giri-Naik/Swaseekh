/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Transpile packages that need it
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'dotenv': 'dotenv',
      });
    }
    return config;
  },
}

export default nextConfig
