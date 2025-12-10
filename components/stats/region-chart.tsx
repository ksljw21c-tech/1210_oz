"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { RegionStats } from "@/lib/types/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트
 *
 * 각 시/도별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 * recharts 기반의 Bar Chart를 사용하며, 바 클릭 시 해당 지역 필터가
 * 적용된 홈페이지로 이동하는 인터랙션을 제공합니다.
 *
 * 주요 기능:
 * - 지역별 관광지 개수 Bar Chart 표시
 * - 바 클릭 시 해당 지역 목록 페이지로 이동
 * - 호버 시 정확한 개수 표시 (Tooltip)
 * - 다크/라이트 모드 지원
 * - 반응형 디자인
 * - 로딩 상태 (Skeleton UI)
 *
 * @dependencies
 * - lib/types/stats: RegionStats 타입
 * - components/ui/chart: Chart 컴포넌트 (shadcn/ui)
 * - components/ui/card: Card 컴포넌트
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - recharts: BarChart, Bar, XAxis, YAxis 등
 * - next/navigation: useRouter
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6.1 지역별 관광지 분포)
 */

interface RegionChartProps {
  /** 지역별 통계 데이터 */
  regionStats: RegionStats[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 표시할 지역 개수 (기본값: 10, 0이면 전체) */
  limit?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 숫자를 천 단위 구분 표시로 포맷팅
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 차트 데이터 형식
 */
interface ChartData {
  name: string;
  count: number;
  areaCode: string;
}

/**
 * 지역별 분포 차트 컴포넌트
 */
export function RegionChart({
  regionStats,
  isLoading = false,
  limit = 10,
  className,
}: RegionChartProps) {
  const router = useRouter();

  // 차트 데이터 준비
  const chartData = useMemo<ChartData[]>(() => {
    if (!regionStats || regionStats.length === 0) {
      return [];
    }

    // limit이 0이면 전체, 아니면 상위 N개만
    const data = limit > 0 ? regionStats.slice(0, limit) : regionStats;

    return data.map((stat) => ({
      name: stat.areaName,
      count: stat.count,
      areaCode: stat.areaCode,
    }));
  }, [regionStats, limit]);

  // 바 클릭 핸들러
  const handleBarClick = (data: ChartData) => {
    router.push(`/?areaCode=${data.areaCode}`);
  };

  // 차트 설정
  const chartConfig = {
    count: {
      label: "관광지 개수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 로딩 상태
  if (isLoading || !regionStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>지역별 관광지 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // 빈 상태 처리
  if (regionStats.length === 0 || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>지역별 관광지 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <p>데이터를 불러올 수 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>지역별 관광지 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              aria-label="지역별 관광지 분포 차트"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickFormatter={(value) => formatNumber(value)}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null;
                  }

                  const data = payload[0].payload as ChartData;
                  return (
                    <ChartTooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          관광지 {formatNumber(data.count)}개
                        </p>
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                onClick={(data: unknown) => {
                  // recharts Bar onClick은 { payload: ChartData } 형식으로 전달
                  const eventData = data as { payload?: ChartData };
                  if (eventData?.payload) {
                    handleBarClick(eventData.payload);
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

