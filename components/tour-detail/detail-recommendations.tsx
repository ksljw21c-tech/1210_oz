"use client";

import { useEffect, useState } from "react";
import type { TourItem } from "@/lib/types/tour";
import { getAreaBasedList } from "@/lib/api/tour-api";
import { TourCard } from "@/components/tour-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @file detail-recommendations.tsx
 * @description 추천 관광지 섹션
 *
 * 같은 지역 또는 같은 타입의 다른 관광지를 추천하는 섹션입니다.
 *
 * 주요 기능:
 * - 같은 지역의 다른 관광지 추천
 * - 같은 타입의 다른 관광지 추천
 * - TourCard 컴포넌트 재사용
 * - "더보기" 링크 (홈페이지로 이동)
 *
 * @dependencies
 * - tour-api: getAreaBasedList API
 * - tour-card: TourCard 컴포넌트
 * - shadcn/ui: Card, Button 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.6 추천 관광지)
 */

interface DetailRecommendationsProps {
  /** 현재 관광지 ID (제외할 ID) */
  currentContentId: string;
  /** 지역 코드 */
  areaCode?: string;
  /** 관광 타입 ID */
  contentTypeId?: string;
  /** 최대 표시 개수 */
  maxItems?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 추천 관광지 섹션
 */
export function DetailRecommendations({
  currentContentId,
  areaCode,
  contentTypeId,
  maxItems = 6,
  className,
}: DetailRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      if (!areaCode && !contentTypeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 같은 지역 또는 같은 타입의 관광지 조회
        const result = await getAreaBasedList({
          areaCode: areaCode || undefined,
          contentTypeId: contentTypeId || undefined,
          numOfRows: maxItems + 5, // 현재 관광지 제외를 위해 더 많이 가져오기
          arrange: "A", // 제목순 정렬
        });

        // items.item 배열 추출
        const items = Array.isArray(result.response.body.items.item)
          ? result.response.body.items.item
          : result.response.body.items.item
            ? [result.response.body.items.item]
            : [];

        // 현재 관광지 제외
        const filtered = items.filter(
          (item) => item.contentid !== currentContentId
        );

        // 최대 개수만큼만 표시
        setRecommendations(filtered.slice(0, maxItems));
      } catch (err) {
        console.error("추천 관광지 로딩 실패:", err);
        setError("추천 관광지를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [currentContentId, areaCode, contentTypeId, maxItems]);

  // 데이터가 없으면 섹션 숨김
  if (!isLoading && recommendations.length === 0 && !error) {
    return null;
  }

  // 더보기 링크 URL 생성
  const moreLinkParams = new URLSearchParams();
  if (areaCode) {
    moreLinkParams.set("areaCode", areaCode);
  }
  if (contentTypeId) {
    moreLinkParams.set("contentTypeId", contentTypeId);
  }
  const moreLinkUrl = `/?${moreLinkParams.toString()}`;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>추천 관광지</CardTitle>
          {recommendations.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={moreLinkUrl} className="gap-1">
                더보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: maxItems }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            추천할 관광지가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <TourCard key={item.contentid} tour={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

