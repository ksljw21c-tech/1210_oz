import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 이미지 도메인들
      { hostname: "api.visitkorea.or.kr" }, // API 이미지
      { hostname: "tong.visitkorea.or.kr" }, // 통합 관광 정보 시스템
      { hostname: "phoko.visitkorea.or.kr" }, // 포토코리아 (관광사진)
      { hostname: "korean.visitkorea.or.kr" }, // 대한민국 구석구석
      { hostname: "www.visitkorea.or.kr" }, // 메인 사이트
      // 네이버 지도 이미지 도메인들
      { hostname: "map.pstatic.net" }, // 네이버 지도 타일
      { hostname: "ssl.pstatic.net" }, // 네이버 정적 리소스
      { hostname: "naver.net" }, // 네이버 메인 도메인
    ],
  },
};

export default nextConfig;
