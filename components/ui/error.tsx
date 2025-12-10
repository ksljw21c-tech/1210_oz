"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * API 에러나 기타 에러 발생 시 사용자에게 친화적인 에러 메시지를 표시합니다.
 * 재시도 버튼을 포함할 수 있습니다.
 *
 * @example
 * ```tsx
 * import { ErrorMessage } from '@/components/ui/error';
 *
 * {error && (
 *   <ErrorMessage
 *     message="데이터를 불러오는 중 오류가 발생했습니다."
 *     onRetry={() => refetch()}
 *   />
 * )}
 * ```
 */

interface ErrorMessageProps {
  /** 에러 메시지 */
  message?: string;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 추가 클래스명 */
  className?: string;
  /** 크기 (기본값: "default") */
  size?: "sm" | "default" | "lg";
}

export function ErrorMessage({
  message = "오류가 발생했습니다.",
  onRetry,
  className,
  size = "default",
}: ErrorMessageProps) {
  const sizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      <AlertCircle className="w-12 h-12 text-destructive" />
      <p className={cn("text-muted-foreground", sizeClasses[size])}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </Button>
      )}
    </div>
  );
}

/**
 * 인라인 에러 메시지 (작은 크기)
 */
export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-destructive",
        className
      )}
    >
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}

