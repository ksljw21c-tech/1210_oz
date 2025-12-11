"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MapPin, BarChart3, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file Navbar.tsx
 * @description 메인 네비게이션 바 컴포넌트
 *
 * 주요 기능:
 * - 로고 및 브랜드명 표시
 * - 네비게이션 링크 (홈, 통계, 북마크)
 * - 로그인/로그아웃 버튼 (Clerk)
 *
 * @dependencies
 * - @clerk/nextjs: 인증 기능
 * - lucide-react: 아이콘
 * - next/link: 클라이언트 사이드 라우팅
 */
const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/",
      label: "홈",
      icon: MapPin,
    },
    {
      href: "/stats",
      label: "통계",
      icon: BarChart3,
    },
    {
      href: "/bookmarks",
      label: "북마크",
      icon: Bookmark,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          My Trip
        </Link>

        {/* 네비게이션 링크 */}
        <nav aria-label="메인 네비게이션" className="flex gap-2 items-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("gap-2", isActive && "bg-secondary")}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${link.label} 페이지${isActive ? " (현재 페이지)" : ""}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* 테마 토글 및 로그인/사용자 버튼 */}
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button>로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
