/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains if needed in the future
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
}

export default nextConfig
