"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { TourApiError } from "@/lib/api/tour-api";

/**
 * @file error.tsx
 * @description 라우트 세그먼트 레벨 에러 핸들링
 *
 * Next.js 15 App Router의 error.tsx 파일입니다.
 * 라우트 세그먼트 내에서 발생한 에러를 처리합니다.
 *
 * 주요 기능:
 * - 에러 정보 표시
 * - 에러 타입별 적절한 메시지 제공
 * - 복구 옵션 (재시도, 홈으로 이동)
 * - 사용자 친화적인 인터페이스
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/error} - Next.js error 문서
 */

interface ErrorProps {
  /** 에러 객체 */
  error: Error & { digest?: string };
  /** 에러 상태 초기화 함수 */
  reset: () => void;
}

/**
 * 사용자 친화적인 에러 메시지 변환
 */
function getErrorMessage(error: Error): string {
  // TourApiError인 경우
  if (error instanceof TourApiError) {
    return error.message;
  }

  // 네트워크 관련 에러
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return "네트워크 연결을 확인하고 다시 시도해주세요.";
  }

  // 기타 일반적인 에러
  return "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export default function Error({ error, reset }: ErrorProps) {
  // 에러 로깅 (개발 환경에서만)
  useEffect(() => {
    console.error("에러 발생:", error);
  }, [error]);

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-xl mb-2">
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {errorMessage}
            </p>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  개발자 정보 (클릭하여 상세 정보 보기)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={reset} size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1 gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  홈으로
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              문제가 지속되면{" "}
              <a
                href="mailto:support@mytrip.com"
                className="underline hover:no-underline"
              >
                고객 지원팀
              </a>
              {" "}으로 문의해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
