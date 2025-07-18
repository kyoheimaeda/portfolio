// next.config.js
import path from 'path';
import type { NextConfig } from "next";

// 環境変数の値をビルドログに出力して確認
const r2PublicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
console.log('--- Debug: NEXT_PUBLIC_R2_PUBLIC_DOMAIN ---');
console.log('Value:', r2PublicDomain);
console.log('Type:', typeof r2PublicDomain);
console.log('--- End Debug ---');

if (!r2PublicDomain) {
  throw new Error('Build Error: NEXT_PUBLIC_R2_PUBLIC_DOMAIN environment variable is missing or empty.');
}

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(r2PublicDomain).hostname, // ここでチェック済みの変数を使用
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;