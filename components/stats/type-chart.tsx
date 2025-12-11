"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { TypeStats } from "@/lib/types/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

/**
 * @file type-chart.tsx
 * @description 타입별 관광지 분포 차트 컴포넌트
 *
 * 각 관광 타입별 관광지 개수와 비율을 Donut Chart로 시각화하는 컴포넌트입니다.
 * recharts 기반의 Pie Chart를 사용하며, innerRadius를 설정하여 Donut 효과를 구현합니다.
 * 섹션 클릭 시 해당 타입 필터가 적용된 홈페이지로 이동하는 인터랙션을 제공합니다.
 *
 * 주요 기능:
 * - 타입별 관광지 개수 및 비율 Donut Chart 표시
 * - 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * - 호버 시 타입명, 개수, 비율 표시 (Tooltip)
 * - 다크/라이트 모드 지원
 * - 반응형 디자인
 * - 로딩 상태 (Skeleton UI)
 *
 * @dependencies
 * - lib/types/stats: TypeStats 타입
 * - components/ui/chart: Chart 컴포넌트 (shadcn/ui)
 * - components/ui/card: Card 컴포넌트
 * - components/ui/skeleton: Skeleton 컴포넌트
 * - recharts: PieChart, Pie, Cell 등
 * - next/navigation: useRouter
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6.2 관광 타입별 분포)
 */

interface TypeChartProps {
  /** 타입별 통계 데이터 */
  typeStats: TypeStats[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
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
 * 비율을 백분율로 포맷팅 (소수점 1자리)
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * 차트 데이터 형식
 */
interface ChartData {
  name: string;
  value: number;
  percentage: number;
  contentTypeId: string;
  fill: string;
}

/**
 * 8개 타입에 대한 색상 팔레트
 * shadcn/ui Chart의 chart-1 ~ chart-8 색상 활용
 */
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
] as const;

/**
 * 타입별 분포 차트 컴포넌트
 */
export function TypeChart({
  typeStats,
  isLoading = false,
  className,
}: TypeChartProps) {
  const router = useRouter();

  // 차트 데이터 준비 및 비율 계산
  const chartData = useMemo<ChartData[]>(() => {
    if (!typeStats || typeStats.length === 0) {
      return [];
    }

    // 전체 합계 계산
    const total = typeStats.reduce((sum, stat) => sum + stat.count, 0);

    if (total === 0) {
      return [];
    }

    // 각 타입별 비율 계산 및 색상 할당
    return typeStats.map((stat, index) => {
      const percentage = (stat.count / total) * 100;
      return {
        name: stat.typeName,
        value: stat.count,
        percentage,
        contentTypeId: stat.contentTypeId,
        fill: COLORS[index % COLORS.length],
      };
    });
  }, [typeStats]);

  // 섹션 클릭 핸들러
  const handlePieClick = (data: unknown) => {
    // recharts Pie onClick은 { payload: ChartData } 형식으로 전달
    const eventData = data as { payload?: ChartData };
    if (eventData?.payload) {
      router.push(`/?contentTypeId=${eventData.payload.contentTypeId}`);
    }
  };

  // 차트 설정
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((item, index) => {
      config[item.contentTypeId] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [chartData]);

  // 로딩 상태
  if (isLoading || !typeStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>타입별 관광지 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  // 빈 상태 처리
  if (typeStats.length === 0 || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>타입별 관광지 분포</CardTitle>
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
        <CardTitle>타입별 관광지 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart aria-label="타입별 관광지 분포 차트">
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={80}
                paddingAngle={2}
                onClick={handlePieClick}
                style={{ cursor: "pointer" }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    aria-label={`${entry.name}: ${formatNumber(entry.value)}개 (${formatPercentage(entry.percentage)})`}
                  />
                ))}
              </Pie>
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
                          관광지 {formatNumber(data.value)}개
                        </p>
                        <p className="text-sm text-muted-foreground">
                          비율 {formatPercentage(data.percentage)}
                        </p>
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => {
                  const data = entry.payload as unknown as ChartData;
                  return `${value} (${formatPercentage(data.percentage)})`;
                }}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

