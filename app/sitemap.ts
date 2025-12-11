import type { MetadataRoute } from "next";
import { getAreaBasedList } from "@/lib/api/tour-api";

/**
 * @file sitemap.ts
 * @description 동적 Sitemap 생성
 *
 * Next.js 15 App Router의 sitemap.ts 파일입니다.
 * 검색 엔진에게 사이트의 페이지 구조를 제공합니다.
 *
 * 주요 기능:
 * - 정적 페이지 포함 (홈, 통계, 북마크)
 * - 동적 관광지 상세페이지 자동 생성
 * - 한국관광공사 API를 통한 관광지 목록 조회
 * - 최적화된 우선순위 및 변경 빈도 설정
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/sitemap} - Next.js sitemap 문서
 */

// 메타데이터 베이스 URL (layout.tsx와 동일하게 설정)
const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : new URL("https://yourdomain.com"); // 프로덕션 배포 시 실제 도메인으로 변경 필요

/**
 * 관광지 데이터를 Sitemap 형식으로 변환
 */
async function generateTourSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    // 한국관광공사 API로 관광지 목록 조회
    // 모든 관광지를 가져오기 위해 넉넉한 numOfRows 설정 (최대 10000개)
    const tourData = await getAreaBasedList({
      numOfRows: 1000, // API 제한에 따라 조정 가능
      pageNo: 1,
      arrange: "C", // 수정일순으로 정렬 (최신 콘텐츠 우선)
    });

    if (!tourData || !tourData.response?.body?.items?.item) {
      console.warn("관광지 데이터를 가져올 수 없습니다. 기본 sitemap만 생성합니다.");
      return [];
    }

    // items.item가 배열이 아닌 경우 배열로 변환 (API 응답 구조에 따라 다름)
    const tours = Array.isArray(tourData.response.body.items.item)
      ? tourData.response.body.items.item
      : tourData.response.body.items.item
        ? [tourData.response.body.items.item]
        : [];

    // 각 관광지를 sitemap 항목으로 변환
    const tourEntries: MetadataRoute.Sitemap = tours.map((tour) => {
      // 마지막 수정일 처리 (없으면 현재 날짜 사용)
      let lastModified: Date;
      if (tour.modifiedtime) {
        // modifiedtime은 "YYYYMMDDHHmmss" 형식 (예: "20240101120000")
        const dateStr = tour.modifiedtime;
        if (dateStr.length >= 14) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          const hour = dateStr.substring(8, 10);
          const minute = dateStr.substring(10, 12);
          const second = dateStr.substring(12, 14);

          lastModified = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        } else {
          lastModified = new Date();
        }
      } else {
        lastModified = new Date();
      }

      return {
        url: `${metadataBase.origin}/places/${tour.contentid}`,
        lastModified,
        changeFrequency: "weekly" as const, // 관광지 정보는 주 단위로 업데이트될 수 있음
        priority: 0.7, // 관광지 상세페이지는 중간 우선순위
        images: tour.firstimage || tour.firstimage2 ? [tour.firstimage || tour.firstimage2] : undefined,
      };
    });

    console.log(`Sitemap에 ${tourEntries.length}개의 관광지 페이지가 추가되었습니다.`);
    return tourEntries;

  } catch (error) {
    console.error("관광지 sitemap 생성 실패:", error);
    // 에러 발생 시 빈 배열 반환 (기본 페이지만 포함)
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지들 (항상 포함)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${metadataBase.origin}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0, // 홈페이지는 최고 우선순위
    },
    {
      url: `${metadataBase.origin}/stats`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8, // 통계 페이지는 높은 우선순위
    },
    {
      url: `${metadataBase.origin}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.5, // 북마크 페이지는 낮은 우선순위 (인증 필요)
    },
  ];

  // 동적 관광지 페이지들
  const tourPages = await generateTourSitemapEntries();

  // 모든 페이지 합치기
  return [...staticPages, ...tourPages];
}
