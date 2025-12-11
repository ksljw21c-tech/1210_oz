"use client";

import { useState, useEffect, useCallback } from "react";
import { getAreaBasedList, searchKeyword as searchKeywordAPI, TourApiError } from "@/lib/api/tour-api";
import type { TourItem, ArrangeType } from "@/lib/types/tour";
import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { NaverMap } from "@/components/naver-map";

/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 관광지 목록을 표시하고, 필터링, 검색, 지도 연동 기능을 제공하는 메인 페이지입니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시
 * - 필터링 (지역, 타입, 반려동물, 정렬)
 * - 키워드 검색
 * - 네이버 지도 연동
 * - 반응형 레이아웃
 *
 * @dependencies
 * - tour-api: getAreaBasedList, searchKeyword API
 * - tour-list: 관광지 목록 컴포넌트
 * - tour-filters: 필터 컴포넌트
 * - tour-search: 검색 컴포넌트
 * - naver-map: 네이버 지도 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.1, 2.2, 2.3)
 */

export default function Home() {
  // 상태 관리
  const [tours, setTours] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [resultCount, setResultCount] = useState<number | undefined>(undefined);

  // 필터 상태
  const [areaCode, setAreaCode] = useState<string | undefined>(undefined);
  const [contentTypeIds, setContentTypeIds] = useState<string[] | undefined>(
    undefined
  );
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [arrange, setArrange] = useState<ArrangeType | undefined>(undefined);

  // 선택된 관광지 (지도 연동용)
  const [selectedTour, setSelectedTour] = useState<TourItem | null>(null);

  // 관광지 목록 로드
  const loadTours = useCallback(
    async (isSearch: boolean = false) => {
      try {
        setIsLoading(true);
        setError(null);

        let response;
        if (isSearch && searchKeyword) {
          // 검색 모드
          response = await searchKeywordAPI({
            keyword: searchKeyword,
            areaCode,
            contentTypeId:
              contentTypeIds && contentTypeIds.length === 1
                ? contentTypeIds[0]
                : undefined,
            numOfRows: 20,
            pageNo: 1,
            arrange,
          });
        } else {
          // 목록 조회 모드
          response = await getAreaBasedList({
            areaCode,
            contentTypeId:
              contentTypeIds && contentTypeIds.length === 1
                ? contentTypeIds[0]
                : undefined,
            numOfRows: 20,
            pageNo: 1,
            arrange,
          });
        }

        const items = Array.isArray(response.response.body.items.item)
          ? response.response.body.items.item
          : response.response.body.items.item
            ? [response.response.body.items.item]
            : [];

        setTours(items);
        setResultCount(response.response.body.totalCount || items.length);
      } catch (err) {
        console.error("관광지 목록 로드 실패:", err);
        
        // TourApiError인 경우 더 자세한 메시지 표시
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("알 수 없는 오류가 발생했습니다."));
        }
        
        setTours([]);
        setResultCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [searchKeyword, areaCode, contentTypeIds, arrange]
  );

  // 초기 로드 및 필터 변경 시 재로드
  useEffect(() => {
    if (!searchKeyword) {
      loadTours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaCode, contentTypeIds, petFriendly, arrange]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (filters: {
      areaCode?: string;
      contentTypeIds?: string[];
      petFriendly?: boolean;
      arrange?: ArrangeType;
    }) => {
      setAreaCode(filters.areaCode);
      setContentTypeIds(filters.contentTypeIds);
      setPetFriendly(filters.petFriendly || false);
      setArrange(filters.arrange);
      setSearchKeyword(""); // 필터 변경 시 검색 키워드 초기화
      setResultCount(undefined);
    },
    []
  );

  // 검색 핸들러
  const handleSearch = useCallback(
    (keyword: string) => {
      setSearchKeyword(keyword);
      loadTours(true);
    },
    [loadTours]
  );

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    loadTours(!!searchKeyword);
  }, [loadTours, searchKeyword]);

  // 관광지 선택 핸들러 (지도 연동)
  const handleTourSelect = useCallback((tour: TourItem) => {
    setSelectedTour(tour);
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* 검색 영역 */}
      <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <TourSearch
            onSearch={handleSearch}
            isLoading={isLoading}
            resultCount={resultCount}
          />
        </div>
      </section>

      {/* 필터 영역 */}
      <TourFilters
        areaCode={areaCode}
        contentTypeIds={contentTypeIds}
        petFriendly={petFriendly}
        arrange={arrange}
        onFilterChange={handleFilterChange}
      />

      {/* 메인 콘텐츠 영역 */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 관광지 목록 (좌측) */}
          <div className="order-2 lg:order-1">
            <TourList
              tours={tours}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              onTourSelect={handleTourSelect}
            />
        </div>

          {/* 지도 (우측) */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)]">
            <NaverMap
              tours={tours}
              selectedTour={selectedTour}
              onTourSelect={handleTourSelect}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
