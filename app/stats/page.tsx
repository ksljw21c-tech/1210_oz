import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getStatsSummary } from "@/lib/api/stats-api";
import { StatsSummary } from "@/components/stats/stats-summary";

/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * 관광지 데이터를 차트로 시각화하여 전국 관광지 현황을 파악할 수 있는 통계 페이지입니다.
 * Next.js 15 App Router의 Server Component로 구현하여 성능을 최적화합니다.
 *
 * 주요 기능:
 * - 지역별 관광지 분포 차트 (Bar Chart)
 * - 타입별 관광지 분포 차트 (Donut Chart)
 * - 통계 요약 카드 (전체 개수, Top 3 지역/타입)
 *
 * @dependencies
 * - stats-api: 통계 데이터 수집 API
 * - stats: 통계 컴포넌트들 (stats-summary, region-chart, type-chart)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6 통계 대시보드)
 */

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: "통계 대시보드 | My Trip",
  description: "전국 관광지 현황을 한눈에 파악할 수 있는 통계 대시보드",
};

/**
 * 통계 대시보드 페이지
 */
export default async function StatsPage() {
  // 통계 요약 데이터 수집
  let summary = null;
  try {
    summary = await getStatsSummary();
  } catch (error) {
    console.error("통계 요약 데이터 수집 실패:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 영역 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">통계 대시보드</h1>
              <p className="text-sm text-muted-foreground mt-1">
                전국 관광지 현황을 한눈에 확인하세요
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* 통계 요약 카드 섹션 */}
          <section aria-label="통계 요약">
            <StatsSummary summary={summary} isLoading={false} />
          </section>

          {/* 지역별 분포 차트 섹션 */}
          <section aria-label="지역별 관광지 분포">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-bold mb-4">지역별 관광지 분포</h2>
              {/* TODO: region-chart 컴포넌트 추가 예정 */}
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <p>차트가 여기에 표시됩니다</p>
              </div>
            </div>
          </section>

          {/* 타입별 분포 차트 섹션 */}
          <section aria-label="타입별 관광지 분포">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-bold mb-4">타입별 관광지 분포</h2>
              {/* TODO: type-chart 컴포넌트 추가 예정 */}
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <p>차트가 여기에 표시됩니다</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

