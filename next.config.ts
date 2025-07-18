// next.config.js
import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src')],
  },
  images: {
    domains: [
      // ★ R2の正しい公開URLのホスト名を.env.localから取得するように修正します
      // NEXT_PUBLIC_R2_PUBLIC_DOMAIN が "https://pub-ce560a2a95dd403da34cf9b06fa1c850.r2.dev"
      // のように 'https://' から始まっていることを確認してください！
      process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN
        ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN).hostname
        : '',
    ].filter(Boolean), // 空文字列を除去
    // remotePatterns もより柔軟性がありますが、まずは domains で確実に動かしましょう。
  },
};

export default nextConfig;