"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

/**
 * @file global-error.tsx
 * @description 전역 에러 핸들링
 *
 * Next.js 15 App Router의 global-error.tsx 파일입니다.
 * 루트 레이아웃에서 발생하는 에러를 처리합니다.
 *
 * 주요 특징:
 * - 루트 레이아웃을 대체하므로 HTML/Body 태그 직접 정의
 * - 최소한의 스타일과 컴포넌트만 사용
 * - 심각한 에러 상황에서의 안정적인 폴백
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error} - Next.js global-error 문서
 */

interface GlobalErrorProps {
  /** 에러 객체 */
  error: Error & { digest?: string };
  /** 에러 상태 초기화 함수 (사용하지 않음) */
  reset?: () => void;
}

export default function GlobalError({ error }: GlobalErrorProps) {
  // 에러 로깅 (개발 환경에서만)
  useEffect(() => {
    console.error("전역 에러 발생:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <AlertCircle className="h-20 w-20 text-destructive" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  심각한 오류가 발생했습니다
                </h1>
                <p className="text-muted-foreground">
                  예상치 못한 오류로 인해 서비스를 일시적으로 사용할 수 없습니다.
                  잠시 후 다시 시도해주세요.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  size="lg"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  페이지 새로고침
                </Button>

                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    홈으로 돌아가기
                  </Link>
                </Button>
              </div>

              <div className="pt-6 border-t">
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

                {process.env.NODE_ENV === "development" && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      개발자 정보 (클릭하여 상세 정보 보기)
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {error.message}
                      {error.stack && `\n\n${error.stack}`}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
