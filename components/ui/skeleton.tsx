import { cn } from "@/lib/utils";

/**
 * @file skeleton.tsx
 * @description 스켈레톤 UI 컴포넌트
 *
 * 데이터 로딩 중 콘텐츠 영역을 대체하는 스켈레톤 UI입니다.
 * 사용자 경험을 개선하기 위해 로딩 상태를 시각적으로 표현합니다.
 *
 * @example
 * ```tsx
 * import { Skeleton } from '@/components/ui/skeleton';
 *
 * {isLoading ? (
 *   <Skeleton className="h-20 w-full" />
 * ) : (
 *   <div>콘텐츠</div>
 * )}
 * ```
 */

interface SkeletonProps {
  /** 추가 클래스명 */
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

/**
 * 카드 형태의 스켈레톤
 */
export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * 리스트 형태의 스켈레톤
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

