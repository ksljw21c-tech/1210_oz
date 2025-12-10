"use client";

import { Heart, AlertTriangle } from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 여행 정보 섹션
 *
 * 관광지의 반려동물 동반 가능 여부 및 관련 정보를 표시합니다.
 *
 * 주요 기능:
 * - 반려동물 동반 가능 여부 표시
 * - 반려동물 크기 제한 정보
 * - 반려동물 입장 가능 장소 (실내/실외)
 * - 반려동물 동반 추가 요금
 * - 반려동물 전용 시설 정보
 * - 주의사항 강조 표시
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - shadcn/ui: Card, Badge 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.5 반려동물 동반 여행)
 */

interface DetailPetTourProps {
  /** 반려동물 정보 */
  petInfo: PetTourInfo;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 반려동물 정보 섹션
 */
export function DetailPetTour({ petInfo, className }: DetailPetTourProps) {
  // 정보가 하나도 없으면 섹션 숨김
  const hasInfo =
    petInfo.chkpetleash ||
    petInfo.chkpetsize ||
    petInfo.chkpetplace ||
    petInfo.chkpetfee ||
    petInfo.petinfo;

  if (!hasInfo) {
    return null;
  }

  // 반려동물 동반 가능 여부
  const isPetFriendly = petInfo.chkpetleash === "가능" || petInfo.chkpetleash === "Y";

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          반려동물 동반 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 반려동물 동반 가능 여부 */}
        {petInfo.chkpetleash && (
          <div className="flex items-center gap-3">
            <Heart
              className={cn(
                "h-5 w-5 shrink-0",
                isPetFriendly ? "text-green-600 fill-green-600" : "text-muted-foreground"
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">반려동물 동반</p>
              <Badge
                variant={isPetFriendly ? "default" : "secondary"}
                className="mt-1"
              >
                {isPetFriendly ? "가능" : "불가능"}
              </Badge>
            </div>
          </div>
        )}

        {/* 반려동물 크기 제한 */}
        {petInfo.chkpetsize && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">🐕</span>
            <div className="flex-1">
              <p className="text-sm font-medium">크기 제한</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {petInfo.chkpetsize}
              </p>
            </div>
          </div>
        )}

        {/* 입장 가능 장소 */}
        {petInfo.chkpetplace && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏠</span>
            <div className="flex-1">
              <p className="text-sm font-medium">입장 가능 장소</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {petInfo.chkpetplace}
              </p>
            </div>
          </div>
        )}

        {/* 추가 요금 */}
        {petInfo.chkpetfee && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div className="flex-1">
              <p className="text-sm font-medium">추가 요금</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {petInfo.chkpetfee}
              </p>
            </div>
          </div>
        )}

        {/* 기타 정보 */}
        {petInfo.petinfo && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  주의사항
                </p>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                  {petInfo.petinfo}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 주차장 정보 */}
        {petInfo.parking && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🅿️</span>
              <div className="flex-1">
                <p className="text-sm font-medium">주차장 정보</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {petInfo.parking}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

