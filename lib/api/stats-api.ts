import { getAreaCode, getAreaBasedList } from "@/lib/api/tour-api";
import type { RegionStats, TypeStats, StatsSummary } from "@/lib/types/stats";
import { CONTENT_TYPE, CONTENT_TYPE_NAME } from "@/lib/types/tour";
import type { ContentTypeId } from "@/lib/types/tour";

/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 한국관광공사 공공 API를 활용하여 지역별 및 타입별 관광지 통계 데이터를 수집하는 함수들입니다.
 * `getAreaBasedList` API의 `totalCount` 값을 활용하여 효율적으로 통계를 집계하며,
 * 병렬 처리와 캐싱을 통해 성능을 최적화합니다.
 *
 * 주요 기능:
 * - 지역별 관광지 개수 집계 (getRegionStats)
 * - 타입별 관광지 개수 집계 (getTypeStats)
 * - 전체 통계 요약 (getStatsSummary)
 *
 * 핵심 구현 로직:
 * - 병렬 API 호출 (Promise.allSettled)
 * - 최소 데이터 조회 (numOfRows: 1, totalCount만 활용)
 * - 에러 처리 (일부 실패해도 계속 진행)
 * - Next.js fetch 캐싱 (revalidate: 3600)
 *
 * @dependencies
 * - tour-api: getAreaCode, getAreaBasedList 함수
 * - types/stats: RegionStats, TypeStats, StatsSummary 타입
 * - types/tour: CONTENT_TYPE, CONTENT_TYPE_NAME 상수
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6 통계 대시보드)
 */

/**
 * 지역별 관광지 통계 수집
 * 각 시/도별 관광지 개수를 집계합니다.
 *
 * @returns 지역별 통계 배열 (count 내림차순 정렬)
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  try {
    // 1. 지역 코드 목록 조회
    const areaCodeResponse = await getAreaCode({ numOfRows: 100 });
    const areaCodes = Array.isArray(areaCodeResponse.response.body.items.item)
      ? areaCodeResponse.response.body.items.item
      : areaCodeResponse.response.body.items.item
        ? [areaCodeResponse.response.body.items.item]
        : [];

    if (areaCodes.length === 0) {
      console.warn("지역 코드를 가져올 수 없습니다.");
      return [];
    }

    // 2. 각 지역별 관광지 개수 조회 (병렬 처리)
    const statsPromises = areaCodes.map(async (areaCode) => {
      try {
        const response = await getAreaBasedList({
          areaCode: areaCode.code,
          numOfRows: 1, // totalCount만 필요하므로 최소한의 데이터만 조회
        });

        const count = response.response.body.totalCount || 0;

        return {
          areaCode: areaCode.code,
          areaName: areaCode.name,
          count,
        } as RegionStats;
      } catch (error) {
        console.error(
          `지역 ${areaCode.name} (${areaCode.code}) 통계 조회 실패:`,
          error
        );
        // 실패한 경우 count: 0으로 처리
        return {
          areaCode: areaCode.code,
          areaName: areaCode.name,
          count: 0,
        } as RegionStats;
      }
    });

    // Promise.allSettled로 일부 실패해도 계속 진행
    const results = await Promise.allSettled(statsPromises);

    // 3. 성공한 결과만 추출
    const stats: RegionStats[] = results
      .filter(
        (result): result is PromiseFulfilledResult<RegionStats> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    // 4. count 내림차순 정렬
    stats.sort((a, b) => b.count - a.count);

    return stats;
  } catch (error) {
    console.error("지역별 통계 수집 실패:", error);
    return [];
  }
}

/**
 * 타입별 관광지 통계 수집
 * 각 관광 타입별 관광지 개수를 집계합니다.
 *
 * @returns 타입별 통계 배열 (count 내림차순 정렬)
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  try {
    // 1. 타입 목록 정의 (CONTENT_TYPE 상수 활용)
    const contentTypeIds = Object.values(CONTENT_TYPE) as ContentTypeId[];

    // 2. 각 타입별 관광지 개수 조회 (병렬 처리)
    const statsPromises = contentTypeIds.map(async (contentTypeId) => {
      try {
        const response = await getAreaBasedList({
          contentTypeId,
          numOfRows: 1, // totalCount만 필요하므로 최소한의 데이터만 조회
        });

        const count = response.response.body.totalCount || 0;
        const typeName =
          CONTENT_TYPE_NAME[contentTypeId] || `타입 ${contentTypeId}`;

        return {
          contentTypeId,
          typeName,
          count,
        } as TypeStats;
      } catch (error) {
        console.error(
          `타입 ${contentTypeId} 통계 조회 실패:`,
          error
        );
        // 실패한 경우 count: 0으로 처리
        const typeName =
          CONTENT_TYPE_NAME[contentTypeId] || `타입 ${contentTypeId}`;
        return {
          contentTypeId,
          typeName,
          count: 0,
        } as TypeStats;
      }
    });

    // Promise.allSettled로 일부 실패해도 계속 진행
    const results = await Promise.allSettled(statsPromises);

    // 3. 성공한 결과만 추출
    const stats: TypeStats[] = results
      .filter(
        (result): result is PromiseFulfilledResult<TypeStats> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    // 4. count 내림차순 정렬
    stats.sort((a, b) => b.count - a.count);

    return stats;
  } catch (error) {
    console.error("타입별 통계 수집 실패:", error);
    return [];
  }
}

/**
 * 전체 통계 요약 수집
 * 전체 관광지 수, Top 3 지역, Top 3 타입을 포함한 통계 요약을 생성합니다.
 *
 * @returns 통계 요약 정보
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  try {
    // 1. 병렬 데이터 수집
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 2. 전체 관광지 수 조회 (별도 API 호출)
    let totalCount = 0;
    try {
      const response = await getAreaBasedList({
        numOfRows: 1, // totalCount만 필요
      });
      totalCount = response.response.body.totalCount || 0;
    } catch (error) {
      console.error("전체 관광지 수 조회 실패:", error);
      // 폴백: 모든 지역의 count 합계
      totalCount = regionStats.reduce((sum, stat) => sum + stat.count, 0);
    }

    // 3. Top 3 지역 추출
    const topRegions = regionStats
      .filter((stat) => stat.count > 0)
      .slice(0, 3);

    // 4. Top 3 타입 추출
    const topTypes = typeStats.filter((stat) => stat.count > 0).slice(0, 3);

    // 5. 마지막 업데이트 시간
    const lastUpdated = new Date();

    return {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated,
    };
  } catch (error) {
    console.error("통계 요약 수집 실패:", error);
    // 에러 발생 시 빈 데이터 반환
    return {
      totalCount: 0,
      topRegions: [],
      topTypes: [],
      lastUpdated: new Date(),
    };
  }
}

