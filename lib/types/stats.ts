/**
 * @file stats.ts
 * @description 통계 대시보드 관련 타입 정의
 *
 * 이 파일은 통계 페이지에서 사용하는 데이터 구조를
 * TypeScript 타입으로 정의합니다.
 *
 * 주요 타입:
 * - RegionStats: 지역별 관광지 통계
 * - TypeStats: 타입별 관광지 통계
 * - StatsSummary: 전체 통계 요약
 *
 * @dependencies
 * - 한국관광공사 공공 API: areaBasedList2를 사용하여 통계 데이터 수집
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6 통계 대시보드)
 */

/**
 * 지역별 관광지 통계
 */
export interface RegionStats {
  /** 지역코드 */
  areaCode: string;
  /** 지역명 */
  areaName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 타입별 관광지 통계
 */
export interface TypeStats {
  /** 콘텐츠타입ID */
  contentTypeId: string;
  /** 타입명 */
  typeName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** Top 3 지역 */
  topRegions: RegionStats[];
  /** Top 3 타입 */
  topTypes: TypeStats[];
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}

