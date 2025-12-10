"use client";

import { useState } from "react";
import Image from "next/image";
import type { TourImage } from "@/lib/types/tour";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리
 *
 * 관광지의 이미지 목록을 표시하고, 클릭 시 전체화면 모달로 확대 표시합니다.
 *
 * 주요 기능:
 * - 이미지 그리드 레이아웃
 * - 이미지 클릭 시 전체화면 모달
 * - 이미지 네비게이션 (이전/다음)
 * - 키보드 네비게이션 (ESC, 화살표)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 * - shadcn/ui: Card, Dialog, Button 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.3 이미지 갤러리)
 */

interface DetailGalleryProps {
  /** 이미지 목록 */
  images: TourImage[];
  /** 대표 이미지 URL (있는 경우) */
  firstImage?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 기본 이미지 URL
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 관광지 이미지 갤러리
 */
export function DetailGallery({
  images,
  firstImage,
  className,
}: DetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // 모든 이미지 목록 (대표 이미지 + 갤러리 이미지)
  const allImages: string[] = [];

  // 대표 이미지 추가
  if (firstImage) {
    allImages.push(firstImage);
  }

  // 갤러리 이미지 추가
  images.forEach((img) => {
    if (img.originimgurl && !allImages.includes(img.originimgurl)) {
      allImages.push(img.originimgurl);
    }
  });

  // 이미지가 없으면 섹션 숨김
  if (allImages.length === 0) {
    return null;
  }

  // 이미지 클릭 핸들러
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  // 모달 닫기
  const handleClose = () => {
    setSelectedImageIndex(null);
  };

  // 이전 이미지
  const handlePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1
    );
  };

  // 다음 이미지
  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0
    );
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  const selectedImage =
    selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

  return (
    <>
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">이미지 갤러리</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {allImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border transition-transform hover:scale-105"
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={imageUrl}
                  alt={`${index + 1}번째 이미지`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 전체화면 이미지 모달 */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-7xl p-0"
          onKeyDown={handleKeyDown}
          aria-label="이미지 갤러리"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>이미지 갤러리</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="relative">
              {/* 닫기 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 bg-background/80"
                onClick={handleClose}
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* 이미지 */}
              <div className="relative aspect-video w-full">
                <Image
                  src={selectedImage}
                  alt={`${(selectedImageIndex || 0) + 1}번째 이미지`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* 네비게이션 버튼 */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                    onClick={handlePrevious}
                    aria-label="이전 이미지"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                    onClick={handleNext}
                    aria-label="다음 이미지"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* 이미지 인덱스 표시 */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-4 py-2 text-sm">
                  {(selectedImageIndex || 0) + 1} / {allImages.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

