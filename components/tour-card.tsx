"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_NAME } from "@/lib/types/tour";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 클릭 시 상세페이지로 이동하며, 호버 효과를 제공합니다.
 *
 * 주요 기능:
 * - 썸네일 이미지 표시 (기본 이미지 fallback)
 * - 관광지명, 주소, 타입 뱃지 표시
 * - 간단한 개요 표시 (1-2줄)
 * - 호버 효과 및 클릭 인터랙션
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 * - shadcn/ui: Card, Badge 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.1 관광지 목록)
 */

interface TourCardProps {
  /** 관광지 데이터 */
  tour: TourItem;
  /** 호버 시 콜백 (지도 연동용, 선택) */
  onHover?: (tour: TourItem) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 관광지 카드 컴포넌트
 */
export function TourCard({ tour, onHover, className }: TourCardProps) {
  // 이미지 URL 결정 (firstimage 우선, 없으면 firstimage2, 둘 다 없으면 기본 이미지)
  const imageUrl = tour.firstimage || tour.firstimage2 || DEFAULT_IMAGE;

  // 관광 타입 이름 가져오기
  const typeName =
    CONTENT_TYPE_NAME[tour.contenttypeid as keyof typeof CONTENT_TYPE_NAME] ||
    "기타";

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn("block", className)}
      onMouseEnter={() => onHover?.(tour)}
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
        {/* 썸네일 이미지 */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>

        <CardContent className="p-4">
          {/* 관광지명 */}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight">
            {tour.title}
          </h3>

          {/* 주소 및 타입 뱃지 */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{tour.addr1}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {typeName}
            </Badge>
          </div>

          {/* 소분류 (있는 경우만 표시) */}
          {tour.cat3 && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {tour.cat3}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

