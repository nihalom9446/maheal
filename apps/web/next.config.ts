import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone build output for containerization (Docker)
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Allow importing from workspace packages
  transpilePackages: ['@maheall/shared'],

  // Strict mode for better debugging
  reactStrictMode: true,

  // Image domains for future use
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;