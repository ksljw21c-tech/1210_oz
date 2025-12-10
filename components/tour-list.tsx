"use client";

import type { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error";
import { cn } from "@/lib/utils";

/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩 상태, 빈 상태, 에러 상태를 처리합니다.
 *
 * 주요 기능:
 * - 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
 * - 로딩 상태 표시 (Skeleton UI)
 * - 빈 상태 처리
 * - 에러 처리 및 재시도
 *
 * @dependencies
 * - tour-card: 관광지 카드 컴포넌트
 * - skeleton: 로딩 스켈레톤 UI
 * - error: 에러 메시지 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.1 관광지 목록)
 */

interface TourListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 객체 */
  error?: Error | null;
  /** 재시도 콜백 */
  onRetry?: () => void;
  /** 관광지 호버 시 콜백 (지도 연동용) */
  onTourHover?: (tour: TourItem) => void;
  /** 관광지 클릭 시 콜백 (지도 연동용) */
  onTourClick?: (tour: TourItem) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 목록 컴포넌트
 */
export function TourList({
  tours,
  isLoading = false,
  error = null,
  onRetry,
  onTourHover,
  onTourClick,
  className,
}: TourListProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <ErrorMessage
        message="관광지 목록을 불러오는 중 오류가 발생했습니다."
        onRetry={onRetry}
      />
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          검색 결과가 없습니다
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          다른 조건으로 검색해보세요
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {tours.map((tour) => (
        <TourCard
          key={tour.contentid}
          tour={tour}
          onHover={onTourHover}
        />
      ))}
    </div>
  );
}

