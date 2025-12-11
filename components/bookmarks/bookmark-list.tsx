"use client";

import type { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error";
import { Bookmark, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * TourCard를 재사용하여 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * - 북마크한 관광지 목록 표시
 * - 반응형 그리드 레이아웃
 * - 빈 상태 처리 (북마크 없을 때)
 * - 로딩 상태 (Skeleton UI)
 * - 에러 처리 및 재시도
 *
 * @dependencies
 * - tour-card: 관광지 카드 컴포넌트
 * - skeleton: 로딩 스켈레톤 UI
 * - error: 에러 메시지 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 */

interface BookmarkListProps {
  /** 관광지 목록 (북마크된 관광지들) */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 객체 */
  error?: Error | null;
  /** 재시도 콜백 */
  onRetry?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 목록 컴포넌트
 */
export function BookmarkList({
  tours,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: BookmarkListProps) {
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <ErrorMessage
            message="북마크 목록을 불러오는 중 오류가 발생했습니다."
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  // 빈 상태 (북마크가 없을 때)
  if (tours.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Bookmark className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">북마크한 관광지가 없습니다</h3>
              <p className="text-muted-foreground max-w-sm">
                관심 있는 관광지를 북마크하면 여기에 표시됩니다.
                전국의 다양한 관광지를 둘러보세요!
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link href="/" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  관광지 둘러보기
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 북마크 목록 표시
  return (
    <div className="space-y-6">
      {/* 북마크 개수 표시 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {tours.length}개의 북마크
        </p>
      </div>

      {/* 관광지 그리드 */}
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
            // 북마크 페이지에서는 지도 연동을 하지 않으므로 onHover 생략
          />
        ))}
      </div>

      {/* 추가 안내 */}
      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          더 많은 관광지를 발견하고 북마크해보세요!
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/">더 많은 관광지 보기</Link>
        </Button>
      </div>
    </div>
  );
}
