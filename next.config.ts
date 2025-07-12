import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  // 他の設定があればここに書く
};

export default nextConfig;
