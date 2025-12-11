import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, Search } from "lucide-react";

/**
 * @file not-found.tsx
 * @description 전역 404 페이지
 *
 * Next.js 15 App Router의 전역 not-found 페이지입니다.
 * 존재하지 않는 라우트에 접근할 때 표시됩니다.
 *
 * 주요 기능:
 * - 사용자 친화적인 404 메시지 표시
 * - 홈으로 돌아가기 버튼
 * - 관광지 검색 유도 (선택 사항)
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/not-found} - Next.js not-found 문서
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-2">
            404
          </CardTitle>
          <CardTitle className="text-xl">
            페이지를 찾을 수 없습니다
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              URL을 다시 확인하시거나 아래 버튼을 클릭해주세요.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild className="gap-2">
              <Link href="/">
                <Search className="h-4 w-4" />
                관광지 찾아보기
              </Link>
            </Button>
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
