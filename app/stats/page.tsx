import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import {
  getStatsSummary,
  getRegionStats,
  getTypeStats,
} from "@/lib/api/stats-api";
import { StatsSummary } from "@/components/stats/stats-summary";
import { RegionChart } from "@/components/stats/region-chart";
import { TypeChart } from "@/components/stats/type-chart";
import { ErrorMessage } from "@/components/ui/error";

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
  let regionStats = null;
  let typeStats = null;
  const errors = {
    summary: null as Error | null,
    regionStats: null as Error | null,
    typeStats: null as Error | null,
  };

  // 각 API 호출을 개별적으로 처리하여 일부 실패해도 나머지 데이터는 표시
  try {
    const results = await Promise.allSettled([
      getStatsSummary(),
      getRegionStats(),
      getTypeStats(),
    ]);

    // 결과 처리
    if (results[0].status === "fulfilled") {
      summary = results[0].value;
    } else {
      errors.summary = results[0].reason as Error;
      console.error("통계 요약 데이터 수집 실패:", results[0].reason);
    }

    if (results[1].status === "fulfilled") {
      regionStats = results[1].value;
    } else {
      errors.regionStats = results[1].reason as Error;
      console.error("지역별 통계 데이터 수집 실패:", results[1].reason);
    }

    if (results[2].status === "fulfilled") {
      typeStats = results[2].value;
    } else {
      errors.typeStats = results[2].reason as Error;
      console.error("타입별 통계 데이터 수집 실패:", results[2].reason);
    }
  } catch (error) {
    console.error("통계 데이터 수집 중 예상치 못한 오류:", error);
    // 전체 실패 시 모든 에러로 표시
    const defaultError = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");
    errors.summary = defaultError;
    errors.regionStats = defaultError;
    errors.typeStats = defaultError;
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
            {errors.summary ? (
              <ErrorMessage
                message="통계 요약 데이터를 불러오는 중 오류가 발생했습니다."
                onRetry={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              />
            ) : (
              <StatsSummary summary={summary} isLoading={false} />
            )}
          </section>

          {/* 지역별 분포 차트 섹션 */}
          <section aria-label="지역별 관광지 분포">
            {errors.regionStats ? (
              <ErrorMessage
                message="지역별 통계 데이터를 불러오는 중 오류가 발생했습니다."
                onRetry={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              />
            ) : (
              <RegionChart
                regionStats={regionStats}
                isLoading={false}
                limit={10}
              />
            )}
          </section>

          {/* 타입별 분포 차트 섹션 */}
          <section aria-label="타입별 관광지 분포">
            {errors.typeStats ? (
              <ErrorMessage
                message="타입별 통계 데이터를 불러오는 중 오류가 발생했습니다."
                onRetry={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              />
            ) : (
              <TypeChart typeStats={typeStats} isLoading={false} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

