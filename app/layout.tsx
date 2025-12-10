import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Trip - 한국 관광지 정보 서비스",
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
  ],
  authors: [{ name: "My Trip" }],
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국 관광지 정보를 한눈에! 지역별, 타입별 관광지 검색과 지도에서 위치 확인까지",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국 관광지 정보를 한눈에! 지역별, 타입별 관광지 검색과 지도에서 위치 확인까지",
  },
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
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
