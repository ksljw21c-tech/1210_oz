import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * API 호출 중이나 데이터 로딩 중에 표시되는 로딩 인디케이터입니다.
 *
 * @example
 * ```tsx
 * import { Loading } from '@/components/ui/loading';
 *
 * {isLoading && <Loading />}
 * ```
 */

interface LoadingProps {
  /** 크기 (기본값: "default") */
  size?: "sm" | "default" | "lg";
  /** 추가 클래스명 */
  className?: string;
  /** 텍스트 표시 여부 */
  showText?: boolean;
  /** 커스텀 텍스트 */
  text?: string;
}

export function Loading({
  size = "default",
  className,
  showText = false,
  text = "로딩 중...",
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
      />
      {showText && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

