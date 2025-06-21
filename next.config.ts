import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'github.com',
      'raw.githubusercontent.com'
    ],
    // 또는 더 간단하게 모든 외부 이미지 허용 (개발용)
    // unoptimized: true,
  },
  eslint: {
    // 빌드 시 ESLint 오류 무시 (선택사항)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류 무시 (선택사항)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;