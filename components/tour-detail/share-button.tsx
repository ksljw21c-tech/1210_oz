"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 현재 페이지 URL을 클립보드에 복사하는 기능을 제공합니다.
 *
 * 주요 기능:
 * - URL 복사 기능
 * - 복사 완료 피드백
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - shadcn/ui: Button 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 공유하기)
 */

interface ShareButtonProps {
  /** 관광지 ID */
  contentId: string;
  /** 관광지명 */
  title: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 공유 버튼 컴포넌트
 */
export function ShareButton({
  contentId,
  title,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // URL 복사 기능
  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/places/${contentId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      // 폴백: 사용자에게 수동 복사 안내
      alert("링크 복사에 실패했습니다. 주소창에서 직접 복사해주세요.");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      className={cn("", className)}
      aria-label="링크 공유"
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <Share2 className="h-5 w-5" />
      )}
    </Button>
  );
}

