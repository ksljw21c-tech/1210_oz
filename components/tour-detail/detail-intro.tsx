"use client";

import {
  Clock,
  Calendar,
  DollarSign,
  Car,
  Users,
  Baby,
  Heart,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션
 *
 * 관광지의 운영 시간, 휴무일, 요금, 주차, 수용인원 등의 운영 정보를 표시합니다.
 * 타입별로 필드 구조가 다르므로 조건부 렌더링을 사용합니다.
 *
 * 주요 기능:
 * - 운영시간/개장시간 표시
 * - 휴무일 표시
 * - 이용요금 표시
 * - 주차 가능 여부 표시
 * - 수용인원 표시
 * - 체험 프로그램 표시
 * - 유모차/반려동물 동반 가능 여부 표시
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - shadcn/ui: Card 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.2 운영 정보 섹션)
 */

interface DetailIntroProps {
  /** 관광지 운영 정보 */
  intro: TourIntro;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 정보 항목 컴포넌트
 */
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * 관광지 운영 정보 섹션
 */
export function DetailIntro({ intro, className }: DetailIntroProps) {
  // 정보가 하나도 없으면 섹션 숨김
  const hasInfo =
    intro.usetime ||
    intro.restdate ||
    intro.parking ||
    intro.accomcount ||
    intro.chkbabycarriage ||
    intro.chkpet;

  if (!hasInfo) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>운영 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 운영시간 */}
        {intro.usetime && (
          <InfoItem
            icon={Clock}
            label="운영시간"
            value={intro.usetime}
          />
        )}

        {/* 휴무일 */}
        {intro.restdate && (
          <InfoItem
            icon={Calendar}
            label="휴무일"
            value={intro.restdate}
          />
        )}

        {/* 이용요금 (타입별로 필드명이 다를 수 있음: usefee, usefeeleports, usetimeculture 등) */}
        {(() => {
          const feeField =
            (intro as any).usefee ||
            (intro as any).usefeeleports ||
            (intro as any).usetimeculture;
          return feeField ? (
            <InfoItem icon={DollarSign} label="이용요금" value={feeField} />
          ) : null;
        })()}

        {/* 주차 가능 여부 */}
        {intro.parking && (
          <InfoItem
            icon={Car}
            label="주차"
            value={intro.parking}
          />
        )}

        {/* 수용인원 */}
        {intro.accomcount && (
          <InfoItem
            icon={Users}
            label="수용인원"
            value={intro.accomcount}
          />
        )}

        {/* 유모차 대여 */}
        {intro.chkbabycarriage && (
          <InfoItem
            icon={Baby}
            label="유모차 대여"
            value={intro.chkbabycarriage}
          />
        )}

        {/* 반려동물 동반 */}
        {intro.chkpet && (
          <InfoItem
            icon={Heart}
            label="반려동물 동반"
            value={intro.chkpet}
          />
        )}

        {/* 체험 프로그램 */}
        {intro.expguide && (
          <div className="pt-2 border-t">
            <InfoItem
              icon={Users}
              label="체험 프로그램"
              value={intro.expguide}
            />
          </div>
        )}

        {/* 문의처 */}
        {intro.infocenter && (
          <div className="pt-2 border-t">
            <InfoItem
              icon={Clock}
              label="문의처"
              value={intro.infocenter}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

