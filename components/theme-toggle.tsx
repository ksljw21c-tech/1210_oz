"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * @file theme-toggle.tsx
 * @description 테마 전환 토글 버튼 컴포넌트
 *
 * 라이트 모드와 다크 모드 간 전환을 위한 토글 버튼입니다.
 * 현재 테마 상태에 따라 아이콘과 라벨이 변경됩니다.
 *
 * 주요 기능:
 * - 테마 상태 확인 (useTheme 훅)
 * - 클릭 시 테마 전환 (light ↔ dark)
 * - 접근성 지원 (aria-label)
 * - 로딩 상태 처리 (마운트 전)
 *
 * @dependencies
 * - next-themes: useTheme 훅
 * - lucide-react: Sun, Moon 아이콘
 * - shadcn/ui: Button 컴포넌트
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // 클라이언트 사이드에서만 렌더링 (하이드레이션 불일치 방지)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 사이드 렌더링 시 빈 div 반환 (플래시 방지)
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="w-9 h-9"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
