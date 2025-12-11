import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 메타데이터 베이스 URL 설정
const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : new URL("https://yourdomain.com"); // 프로덕션 배포 시 실제 도메인으로 변경 필요

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "My Trip - 한국 관광지 정보 서비스",
    template: "%s | My Trip",
  },
  description:
    "전국 관광지 정보를 한눈에! 지역별, 타입별 관광지 검색과 지도에서 위치 확인까지. 한국관광공사 공공 API 기반의 관광지 정보 서비스",
  keywords: [
    "관광지",
    "여행",
    "한국",
    "관광정보",
    "지도",
    "검색",
    "반려동물 동반",
    "한국관광공사",
    "관광지 검색",
    "여행 정보",
  ],
  authors: [{ name: "My Trip" }],
  creator: "My Trip Team",
  publisher: "My Trip",

  // Open Graph 메타태그
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국 관광지 정보를 한눈에! 지역별, 타입별 관광지 검색과 지도에서 위치 확인까지",
    url: "/",
    siteName: "My Trip",
    images: [
      {
        url: "/og-image.png", // public 폴더에 og-image.png 추가 필요
        width: 1200,
        height: 630,
        alt: "My Trip - 한국 관광지 정보 서비스",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },

  // Twitter Card 메타태그
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국 관광지 정보를 한눈에! 지역별, 타입별 관광지 검색과 지도에서 위치 확인까지",
    images: ["/og-image.png"],
    creator: "@mytrip_kr", // 선택 사항
    site: "@mytrip_kr", // 선택 사항
  },

  // Robots 메타태그 (SEO 최적화)
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL 및 언어 대체 링크
  alternates: {
    canonical: "/",
    // 향후 다국어 지원 시 추가
    // languages: {
    //   'en-US': '/en-US',
    //   'ja-JP': '/ja-JP',
    // },
  },

  // 기타 메타태그
  category: "Travel & Tourism",
  classification: "Tourism Information Service",
};

/**
 * 한국어 로컬라이제이션 설정
 *
 * Clerk 공식 가이드에 따른 한국어 로컬라이제이션:
 * - 기본 한국어 번역: @clerk/localizations의 koKR 사용
 * - 커스텀 에러 메시지: 한국어로 개선된 에러 메시지 제공
 *
 * @see {@link https://clerk.com/docs/guides/customizing-clerk/localization} - Clerk 공식 문서
 */
const koreanLocalization = {
  ...koKR,
  // 커스텀 에러 메시지 (한국어로 개선)
  unstable__errors: {
    ...koKR.unstable__errors,
    // 접근이 허용되지 않은 이메일 도메인
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의하세요.",
    // 잘못된 자격 증명
    form_identifier_not_found: "이메일 주소를 찾을 수 없습니다.",
    form_password_incorrect: "비밀번호가 올바르지 않습니다.",
    // 기타 일반적인 에러
    form_param_format_invalid: "입력 형식이 올바르지 않습니다.",
    form_param_nil: "필수 입력 항목이 누락되었습니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koreanLocalization}>
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              메인 콘텐츠로 건너뛰기
            </a>
            <SyncUserProvider>
              <Navbar />
              <main id="main-content" role="main" className="min-h-screen">
                {children}
              </main>
            </SyncUserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
