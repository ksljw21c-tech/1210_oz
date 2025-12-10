"use client";

import { useState, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색하는 컴포넌트입니다.
 * 엔터 키 또는 검색 버튼으로 검색을 실행합니다.
 *
 * 주요 기능:
 * - 검색창 입력
 * - 엔터 키 또는 버튼 클릭으로 검색
 * - 검색 중 로딩 표시
 * - 검색 결과 개수 표시
 *
 * @dependencies
 * - shadcn/ui: Input, Button 컴포넌트
 * - lucide-react: 아이콘
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.3 키워드 검색)
 */

interface TourSearchProps {
  /** 검색 실행 콜백 */
  onSearch: (keyword: string) => void;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 검색 결과 개수 */
  resultCount?: number;
  /** 초기 검색 키워드 */
  initialKeyword?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 검색 컴포넌트
 */
export function TourSearch({
  onSearch,
  isLoading = false,
  resultCount,
  initialKeyword = "",
  className,
}: TourSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword);

  // 검색 실행
  const handleSearch = useCallback(() => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      onSearch(trimmedKeyword);
    }
  }, [keyword, onSearch]);

  // 엔터 키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="관광지명, 주소, 키워드로 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !keyword.trim()}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검색 중
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              검색
            </>
          )}
        </Button>
      </div>

      {/* 검색 결과 개수 표시 */}
      {resultCount !== undefined && resultCount > 0 && (
        <p className="text-sm text-muted-foreground">
          총 {resultCount.toLocaleString()}개의 결과
        </p>
      )}
    </div>
  );
}

