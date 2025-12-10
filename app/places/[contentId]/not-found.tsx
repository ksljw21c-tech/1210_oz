import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * @file not-found.tsx
 * @description 404 페이지 (관광지를 찾을 수 없을 때)
 */

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          관광지를 찾을 수 없습니다
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          요청하신 관광지 정보가 존재하지 않거나 삭제되었습니다.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}

