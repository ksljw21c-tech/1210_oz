"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE_NAME } from "@/lib/types/tour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션
 *
 * 관광지의 기본 정보를 표시하는 컴포넌트입니다.
 * 주소 복사, 전화번호 연결, 홈페이지 링크 등의 기능을 제공합니다.
 *
 * 주요 기능:
 * - 관광지명, 대표 이미지 표시
 * - 주소 표시 및 복사 기능
 * - 전화번호 클릭 시 전화 연결
 * - 홈페이지 링크
 * - 개요 표시
 * - 관광 타입 및 카테고리 뱃지
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 * - shadcn/ui: Badge, Button, Card 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.1 기본 정보 섹션)
 */

interface DetailInfoProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 기본 이미지 URL
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 관광지 기본 정보 섹션
 */
export function DetailInfo({ detail, className }: DetailInfoProps) {
  const [copied, setCopied] = useState(false);

  // 이미지 URL 결정
  const imageUrl = detail.firstimage || detail.firstimage2 || DEFAULT_IMAGE;

  // 주소 조합
  const fullAddress = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`
    : detail.addr1;

  // 주소 복사 기능
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
    }
  };

  // 관광 타입 이름
  const typeName =
    CONTENT_TYPE_NAME[detail.contenttypeid as keyof typeof CONTENT_TYPE_NAME] ||
    "기타";

  // HTML 태그 제거 함수
  const stripHtml = (html?: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* 관광지명 */}
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">{detail.title}</h1>
      </div>

      {/* 대표 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
        <Image
          src={imageUrl}
          alt={detail.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority
        />
      </div>

      {/* 기본 정보 카드 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 주소 */}
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">주소</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fullAddress}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 gap-1.5"
                  onClick={handleCopyAddress}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      주소 복사
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 전화번호 */}
            {detail.tel && (
              <div className="flex items-start gap-2">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">전화번호</p>
                  <a
                    href={`tel:${detail.tel}`}
                    className="mt-1 text-sm text-primary hover:underline"
                  >
                    {detail.tel}
                  </a>
                </div>
              </div>
            )}

            {/* 홈페이지 */}
            {detail.homepage && (
              <div className="flex items-start gap-2">
                <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">홈페이지</p>
                  <a
                    href={detail.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-primary hover:underline"
                  >
                    {detail.homepage}
                  </a>
                </div>
              </div>
            )}

            {/* 관광 타입 및 카테고리 */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{typeName}</Badge>
              {detail.cat1 && (
                <Badge variant="outline" className="text-xs">
                  {detail.cat1}
                </Badge>
              )}
              {detail.cat2 && (
                <Badge variant="outline" className="text-xs">
                  {detail.cat2}
                </Badge>
              )}
              {detail.cat3 && (
                <Badge variant="outline" className="text-xs">
                  {detail.cat3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개요 */}
      {detail.overview && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">개요</h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: detail.overview,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

