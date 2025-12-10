"use client";

import Link from "next/link";
import { MapPin, BarChart3, TrendingUp, Clock } from "lucide-react";
import type { StatsSummary } from "@/lib/types/stats";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드 상단에 전체 관광지 수, Top 3 지역, Top 3 타입을
 * 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 전체 관광지 수 표시
 * - Top 3 지역 카드 (클릭 시 해당 지역 필터 적용)
 * - Top 3 타입 카드 (클릭 시 해당 타입 필터 적용)
 * - 마지막 업데이트 시간 표시
 * - 로딩 상태 (Skeleton UI)
 *
 * @dependencies
 * - lib/types/stats: StatsSummary 타입
 * - components/ui/card: Card 컴포넌트
 * - components/ui/badge: Badge 컴포넌트
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - lucide-react: 아이콘
 * - next/link: 클라이언트 사이드 라우팅
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6.3 통계 요약 카드)
 */

interface StatsSummaryProps {
  /** 통계 요약 데이터 */
  summary: StatsSummary | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 숫자를 천 단위 구분 표시로 포맷팅
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 마지막 업데이트 시간을 상대 시간 또는 절대 시간으로 포맷팅
 */
function formatLastUpdated(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "방금 전";
  }
  if (diffMins < 60) {
    return `${diffMins}분 전`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 순위 뱃지 색상 변형
 */
function getRankVariant(rank: number): "default" | "secondary" | "outline" {
  if (rank === 1) return "default";
  if (rank === 2) return "secondary";
  return "outline";
}

/**
 * 통계 요약 카드 컴포넌트
 */
export function StatsSummary({
  summary,
  isLoading = false,
  className,
}: StatsSummaryProps) {
  // 로딩 상태
  if (isLoading || !summary) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
        aria-label="통계 요약 로딩 중"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 빈 상태 처리
  if (
    summary.totalCount === 0 &&
    summary.topRegions.length === 0 &&
    summary.topTypes.length === 0
  ) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>데이터를 불러올 수 없습니다</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      aria-label="통계 요약"
    >
      {/* 전체 관광지 수 카드 */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">전체 관광지 수</p>
          </div>
          <p
            className="text-3xl font-bold mb-2"
            aria-label={`전체 관광지 수: ${formatNumber(summary.totalCount)}개`}
          >
            {formatNumber(summary.totalCount)}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatLastUpdated(summary.lastUpdated)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 지역 카드 */}
      {summary.topRegions.slice(0, 3).map((region, index) => {
        const rank = index + 1;
        return (
          <Link
            key={region.areaCode}
            href={`/?areaCode=${region.areaCode}`}
            className="block"
          >
            <Card
              className="h-full transition-all hover:shadow-md hover:scale-105 cursor-pointer"
              role="button"
              aria-label={`${rank}위 지역: ${region.areaName}, 관광지 ${formatNumber(region.count)}개`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={getRankVariant(rank)}>
                    {rank}위
                  </Badge>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{region.areaName}</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatNumber(region.count)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">개 관광지</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      {/* Top 3 타입 카드 (3개 미만인 경우 빈 카드로 채우기) */}
      {summary.topTypes.slice(0, 3).map((type, index) => {
        const rank = index + 1;
        return (
          <Link
            key={type.contentTypeId}
            href={`/?contentTypeId=${type.contentTypeId}`}
            className="block"
          >
            <Card
              className="h-full transition-all hover:shadow-md hover:scale-105 cursor-pointer"
              role="button"
              aria-label={`${rank}위 타입: ${type.typeName}, 관광지 ${formatNumber(type.count)}개`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={getRankVariant(rank)}>
                    {rank}위
                  </Badge>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{type.typeName}</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatNumber(type.count)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">개 관광지</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      {/* Top 3 타입이 3개 미만인 경우 빈 카드로 채우기 */}
      {summary.topTypes.length < 3 &&
        Array.from({ length: 3 - summary.topTypes.length }).map((_, index) => (
          <Card key={`empty-type-${index}`} className="opacity-50">
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="text-sm">데이터 없음</p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

