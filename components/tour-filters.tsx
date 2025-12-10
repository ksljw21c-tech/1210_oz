"use client";

import { useEffect, useState } from "react";
import { MapPin, Filter, X } from "lucide-react";
import { getAreaCode } from "@/lib/api/tour-api";
import type { AreaCode, ArrangeType } from "@/lib/types/tour";
import { CONTENT_TYPE, CONTENT_TYPE_NAME, ARRANGE } from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 반려동물 동반, 정렬 옵션을 제공하는 필터 컴포넌트입니다.
 *
 * 주요 기능:
 * - 지역 필터 (시/도 선택)
 * - 관광 타입 필터 (다중 선택)
 * - 반려동물 동반 가능 필터
 * - 정렬 옵션
 * - 필터 초기화
 *
 * @dependencies
 * - tour-api: getAreaCode API
 * - shadcn/ui: Select, Checkbox, Switch 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.1 관광지 목록)
 */

interface TourFiltersProps {
  /** 선택된 지역 코드 */
  areaCode?: string;
  /** 선택된 관광 타입 ID 배열 */
  contentTypeIds?: string[];
  /** 반려동물 동반 가능 여부 */
  petFriendly?: boolean;
  /** 정렬 옵션 */
  arrange?: ArrangeType;
  /** 필터 변경 콜백 */
  onFilterChange: (filters: {
    areaCode?: string;
    contentTypeIds?: string[];
    petFriendly?: boolean;
    arrange?: ArrangeType;
  }) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 필터 컴포넌트
 */
export function TourFilters({
  areaCode,
  contentTypeIds = [],
  petFriendly = false,
  arrange,
  onFilterChange,
  className,
}: TourFiltersProps) {
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(
    contentTypeIds || []
  );

  // 지역 코드 로드
  useEffect(() => {
    async function loadAreaCodes() {
      try {
        setIsLoadingAreas(true);
        const response = await getAreaCode({ numOfRows: 20 });
        const items = Array.isArray(response.response.body.items.item)
          ? response.response.body.items.item
          : response.response.body.items.item
            ? [response.response.body.items.item]
            : [];
        setAreaCodes(items);
      } catch (error) {
        console.error("지역 코드 로드 실패:", error);
      } finally {
        setIsLoadingAreas(false);
      }
    }

    loadAreaCodes();
  }, []);

  // 지역 필터 변경
  const handleAreaChange = (value: string) => {
    onFilterChange({
      areaCode: value === "all" ? undefined : value,
      contentTypeIds: selectedContentTypes,
      petFriendly,
      arrange,
    });
  };

  // 관광 타입 필터 변경
  const handleContentTypeToggle = (typeId: string) => {
    const newTypes = selectedContentTypes.includes(typeId)
      ? selectedContentTypes.filter((id) => id !== typeId)
      : [...selectedContentTypes, typeId];

    setSelectedContentTypes(newTypes);
    onFilterChange({
      areaCode,
      contentTypeIds: newTypes.length > 0 ? newTypes : undefined,
      petFriendly,
      arrange,
    });
  };

  // 전체 타입 선택/해제
  const handleSelectAllTypes = () => {
    const allTypeIds = Object.values(CONTENT_TYPE);
    if (selectedContentTypes.length === allTypeIds.length) {
      setSelectedContentTypes([]);
      onFilterChange({
        areaCode,
        contentTypeIds: undefined,
        petFriendly,
        arrange,
      });
    } else {
      setSelectedContentTypes(allTypeIds);
      onFilterChange({
        areaCode,
        contentTypeIds: allTypeIds,
        petFriendly,
        arrange,
      });
    }
  };

  // 반려동물 필터 변경
  const handlePetFriendlyChange = (checked: boolean) => {
    onFilterChange({
      areaCode,
      contentTypeIds: selectedContentTypes,
      petFriendly: checked,
      arrange,
    });
  };

  // 정렬 옵션 변경
  const handleArrangeChange = (value: string) => {
    onFilterChange({
      areaCode,
      contentTypeIds: selectedContentTypes,
      petFriendly,
      arrange: value as ArrangeType,
    });
  };

  // 필터 초기화
  const handleReset = () => {
    setSelectedContentTypes([]);
    onFilterChange({
      areaCode: undefined,
      contentTypeIds: undefined,
      petFriendly: false,
      arrange: undefined,
    });
  };

  return (
    <div
      className={cn(
        "sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 지역 필터 */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select
              value={areaCode || "all"}
              onValueChange={handleAreaChange}
              disabled={isLoadingAreas}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={isLoadingAreas ? "로딩 중..." : "지역 선택"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {areaCodes.map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 관광 타입 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllTypes}
                className="text-xs"
              >
                {selectedContentTypes.length ===
                Object.values(CONTENT_TYPE).length
                  ? "전체 해제"
                  : "전체 선택"}
              </Button>
              {Object.entries(CONTENT_TYPE).map(([key, value]) => (
                <div key={value} className="flex items-center gap-1.5">
                  <Checkbox
                    id={`type-${value}`}
                    checked={selectedContentTypes.includes(value)}
                    onCheckedChange={() => handleContentTypeToggle(value)}
                  />
                  <Label
                    htmlFor={`type-${value}`}
                    className="cursor-pointer text-sm"
                  >
                    {CONTENT_TYPE_NAME[value as keyof typeof CONTENT_TYPE_NAME]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 반려동물 동반 필터 */}
          <div className="flex items-center gap-2">
            <Switch
              id="pet-friendly"
              checked={petFriendly}
              onCheckedChange={handlePetFriendlyChange}
            />
            <Label htmlFor="pet-friendly" className="cursor-pointer text-sm">
              반려동물 동반 가능
            </Label>
          </div>

          {/* 정렬 옵션 */}
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={arrange || ARRANGE.MODIFIED}
              onValueChange={handleArrangeChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ARRANGE.MODIFIED}>최신순</SelectItem>
                <SelectItem value={ARRANGE.TITLE}>이름순</SelectItem>
                <SelectItem value={ARRANGE.VIEW}>조회순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 필터 초기화 */}
          {(areaCode ||
            selectedContentTypes.length > 0 ||
            petFriendly ||
            arrange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              초기화
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

