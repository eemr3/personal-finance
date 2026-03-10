import type { NextConfig } from 'next';
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  turbopack: {},
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: '/.well-known/assetlinks.json',
  //       destination: '/.well-known/assetlinks.json',
  //     },
  //   ];
  // },
};

export default withPWA(nextConfig as any);
