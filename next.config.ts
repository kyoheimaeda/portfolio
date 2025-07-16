import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  images: {
    domains: ['hpomumncmbuixaiqyniu.supabase.co'],
    // または remotePatterns を使用する（より柔軟性が高い）
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'hpomumncmbuixaiqyniu.supabase.co',
    //     port: '',
    //     pathname: '/storage/v1/object/public/**',
    //   },
    // ],
  },
};

export default nextConfig;
