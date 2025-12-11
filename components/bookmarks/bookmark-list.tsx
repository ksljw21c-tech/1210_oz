"use client";

import { useState, useMemo } from "react";
import type { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error";
import { Bookmark as BookmarkIcon, MapPin, ArrowUpDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { Bookmark } from "@/lib/api/supabase-api";

/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * TourCard를 재사용하여 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * - 북마크한 관광지 목록 표시
 * - 정렬 옵션 (최신순, 이름순, 지역별)
 * - 개별 삭제 기능
 * - 일괄 삭제 기능 (체크박스 선택)
 * - 반응형 그리드 레이아웃
 * - 빈 상태 처리 (북마크 없을 때)
 * - 로딩 상태 (Skeleton UI)
 * - 에러 처리 및 재시도
 *
 * @dependencies
 * - tour-card: 관광지 카드 컴포넌트
 * - skeleton: 로딩 스켈레톤 UI
 * - error: 에러 메시지 컴포넌트
 * - select: 정렬 옵션 드롭다운
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 */

/** 정렬 옵션 타입 */
type SortOption = "latest" | "name" | "region";

/** 정렬 옵션 라벨 */
const SORT_OPTIONS = {
  latest: "최신순",
  name: "이름순",
  region: "지역별",
} as const;

interface BookmarkListProps {
  /** 관광지 목록 (북마크된 관광지들) */
  tours: TourItem[];
  /** 북마크 메타데이터 (정렬을 위한 created_at 등 정보) */
  bookmarks?: Bookmark[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 객체 */
  error?: Error | null;
  /** 재시도 콜백 */
  onRetry?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 목록 컴포넌트
 */
export function BookmarkList({
  tours,
  bookmarks = [],
  isLoading = false,
  error = null,
  onRetry,
  className,
}: BookmarkListProps) {
  // 상태 관리
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 정렬된 관광지 목록 계산
  const sortedTours = useMemo(() => {
    if (tours.length === 0) return [];

    const toursWithBookmarks = tours.map((tour) => {
      const bookmark = bookmarks.find(b => b.content_id === tour.contentid);
      return { tour, bookmark };
    });

    switch (sortBy) {
      case "latest":
        // 북마크 생성일 기준 정렬 (최신순)
        return toursWithBookmarks
          .sort((a, b) => {
            const dateA = a.bookmark ? new Date(a.bookmark.created_at).getTime() : 0;
            const dateB = b.bookmark ? new Date(b.bookmark.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .map(({ tour }) => tour);

      case "name":
        // 관광지명 기준 정렬 (가나다순)
        return toursWithBookmarks
          .sort((a, b) => a.tour.title.localeCompare(b.tour.title, 'ko'))
          .map(({ tour }) => tour);

      case "region":
        // 지역코드 기준 정렬
        return toursWithBookmarks
          .sort((a, b) => {
            const regionA = a.tour.areacode || "";
            const regionB = b.tour.areacode || "";
            return regionA.localeCompare(regionB, 'ko');
          })
          .map(({ tour }) => tour);

      default:
        return tours;
    }
  }, [tours, bookmarks, sortBy]);

  // 선택된 항목 토글
  const handleSelectItem = (contentId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, contentId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== contentId));
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedItems.length === sortedTours.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedTours.map(tour => tour.contentid));
    }
  };

  // 개별 삭제 핸들러
  const handleDeleteItem = async (contentId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bookmarks?contentId=${contentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("북마크 삭제 실패");
      }

      // 성공 시 목록에서 제거
      setSelectedItems(prev => prev.filter(id => id !== contentId));
      setItemToDelete(null);

      // 페이지 새로고침으로 목록 업데이트
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("북마크 삭제 실패:", error);
      // 에러 처리 (토스트 메시지 등 추가 가능)
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // 일괄 삭제 핸들러
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setIsDeleting(true);
    try {
      // 선택된 항목들을 병렬로 삭제
      const deletePromises = selectedItems.map(contentId =>
        fetch(`/api/bookmarks?contentId=${contentId}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.allSettled(deletePromises);

      // 실패한 항목 확인
      const failedCount = results.filter(result =>
        result.status === "rejected" || (result.status === "fulfilled" && !result.value.ok)
      ).length;

      if (failedCount > 0) {
        console.warn(`${failedCount}개 항목 삭제 실패`);
      }

      // 성공 시 목록 초기화
      setSelectedItems([]);

      // 페이지 새로고침으로 목록 업데이트
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("일괄 삭제 실패:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <ErrorMessage
            message="북마크 목록을 불러오는 중 오류가 발생했습니다."
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  // 빈 상태 (북마크가 없을 때)
  if (tours.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <BookmarkIcon className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">북마크한 관광지가 없습니다</h3>
              <p className="text-muted-foreground max-w-sm">
                관심 있는 관광지를 북마크하면 여기에 표시됩니다.
                전국의 다양한 관광지를 둘러보세요!
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link href="/" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  관광지 둘러보기
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 북마크 목록 표시
  return (
    <div className="space-y-6">
      {/* 헤더 영역: 북마크 개수, 정렬 옵션, 일괄 삭제 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            총 {sortedTours.length}개의 북마크
          </p>

          {/* 전체 선택 체크박스 */}
          {sortedTours.length > 0 && (
            <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === sortedTours.length && sortedTours.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                전체 선택
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 정렬 옵션 */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="region">지역별</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 일괄 삭제 버튼 */}
          {selectedItems.length > 0 && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  선택 삭제 ({selectedItems.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>북마크 일괄 삭제</DialogTitle>
                  <DialogDescription>
                    {`선택한 ${selectedItems.length}개의 북마크를 삭제하시겠습니까?
이 작업은 되돌릴 수 없습니다.`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* 관광지 그리드 */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {sortedTours.map((tour, index) => {
          const isSelected = selectedItems.includes(tour.contentid);
          return (
            <div key={tour.contentid} className="relative group">
              {/* 개별 선택 체크박스 */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSelectItem(tour.contentid, checked as boolean)}
                  className="bg-background/80 backdrop-blur-sm border-2"
                />
              </div>

              {/* 삭제 버튼 */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setItemToDelete(tour.contentid)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>북마크 삭제</DialogTitle>
                      <DialogDescription>
                        {`"${tour.title}"을 북마크에서 제거하시겠습니까?`}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setItemToDelete(null)}>
                        취소
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteItem(tour.contentid)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "삭제 중..." : "삭제"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* 관광지 카드 */}
              <TourCard
                tour={tour}
                className={cn(
                  "transition-all duration-200",
                  isSelected && "ring-2 ring-primary ring-offset-2"
                )}
                priority={index < 6} // 북마크 목록에서도 상위 6개 이미지 우선 로딩
                // 북마크 페이지에서는 지도 연동을 하지 않으므로 onHover 생략
              />
            </div>
          );
        })}
      </div>

      {/* 추가 안내 */}
      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          더 많은 관광지를 발견하고 북마크해보세요!
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/">더 많은 관광지 보기</Link>
        </Button>
      </div>
    </div>
  );
}
