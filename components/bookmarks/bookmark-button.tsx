"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크하거나 북마크를 해제하는 기능을 제공합니다.
 * Clerk 인증을 사용하며, 로그인하지 않은 경우 로그인 페이지로 이동합니다.
 *
 * 주요 기능:
 * - 북마크 상태 확인
 * - 북마크 추가/제거
 * - 인증 상태 확인
 * - 낙관적 업데이트 (Optimistic Update)
 *
 * @dependencies
 * - @clerk/nextjs: useUser 훅
 * - lucide-react: Star 아이콘
 * - shadcn/ui: Button 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 */

interface BookmarkButtonProps {
  /** 관광지 ID */
  contentId: string;
  /** 관광지명 */
  title: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트
 */
export function BookmarkButton({
  contentId,
  title,
  className,
}: BookmarkButtonProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // 북마크 상태 조회
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchBookmarkStatus() {
      try {
        const response = await fetch(
          `/api/bookmarks?contentId=${contentId}`
        );

        if (!response.ok) {
          throw new Error("북마크 상태 조회 실패");
        }

        const { bookmark } = await response.json();
        setIsBookmarked(!!bookmark);
      } catch (error) {
        console.error("북마크 상태 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookmarkStatus();
  }, [isLoaded, user, contentId]);

  // 북마크 토글
  const handleToggle = async () => {
    // 로그인하지 않은 경우 로그인 페이지로 이동
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsToggling(true);

    try {
      if (isBookmarked) {
        // 북마크 제거
        const response = await fetch(
          `/api/bookmarks?contentId=${contentId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("북마크 제거 실패");
        }

        setIsBookmarked(false);
      } else {
        // 북마크 추가
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contentId }),
        });

        if (!response.ok) {
          throw new Error("북마크 추가 실패");
        }

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("북마크 토글 실패:", error);
      // 에러 발생 시 상태 롤백
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn("", className)}
        aria-label="북마크"
      >
        <Star className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isToggling}
      className={cn("", className)}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
    >
      <Star
        className={cn(
          "h-5 w-5 transition-colors",
          isBookmarked
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        )}
      />
    </Button>
  );
}

