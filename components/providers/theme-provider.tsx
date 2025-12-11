"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * @file theme-provider.tsx
 * @description 다크 모드 테마 제공자 컴포넌트
 *
 * Next.js 15 App Router에서 다크 모드 지원을 위한 테마 제공자입니다.
 * 시스템 테마 감지, 로컬 스토리지 저장, 테마 전환 기능을 제공합니다.
 *
 * 주요 기능:
 * - 시스템 테마 자동 감지
 * - 라이트/다크 모드 수동 전환
 * - 테마 상태 로컬 스토리지 저장
 * - 다크 모드 CSS 변수 지원
 *
 * @dependencies
 * - next-themes: 테마 관리 라이브러리
 *
 * @see {@link https://github.com/pacocoursey/next-themes} - next-themes 문서
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
