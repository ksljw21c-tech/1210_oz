import type { MetadataRoute } from "next";

/**
 * @file robots.ts
 * @description Robots.txt 생성
 *
 * Next.js 15 App Router의 robots.ts 파일입니다.
 * 검색 엔진 크롤러에게 사이트 크롤링 규칙을 제공합니다.
 *
 * 주요 기능:
 * - 모든 크롤러에게 주요 페이지 크롤링 허용
 * - API 라우트 및 테스트 페이지 제외
 * - Sitemap URL 제공
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/robots} - Next.js robots 문서
 */

export default function robots(): MetadataRoute.Robots {
  // 메타데이터 베이스 URL (layout.tsx와 동일하게 설정)
  const metadataBase = process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://yourdomain.com"; // 프로덕션 배포 시 실제 도메인으로 변경 필요

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // API 라우트는 크롤링 불필요
          "/auth-test", // 테스트 페이지 제외
          "/storage-test", // 테스트 페이지 제외
          "/sign-in", // 인증 페이지 제외 (선택 사항)
          "/sign-up", // 인증 페이지 제외 (선택 사항)
        ],
        crawlDelay: 1, // 크롤링 간격 (초)
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/auth-test",
          "/storage-test",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${metadataBase}/sitemap.xml`,
    host: metadataBase.replace(/^https?:\/\//, ""), // 프로토콜 제외한 호스트만
  };
}
