// next.config.js
import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN!).hostname,
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;