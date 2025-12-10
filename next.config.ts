import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "api.visitkorea.or.kr" }, // 한국관광공사 이미지
      { hostname: "tong.visitkorea.or.kr" }, // 한국관광공사 이미지
    ],
  },
};

export default nextConfig;
