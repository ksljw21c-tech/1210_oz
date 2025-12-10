"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @file detail-map.tsx
 * @description 관광지 지도 섹션
 *
 * 해당 관광지의 위치를 네이버 지도에 표시하고,
 * 길찾기 기능을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 네이버 지도에 단일 마커 표시
 * - 길찾기 버튼 (네이버 지도 앱/웹 연동)
 * - 좌표 변환 (KATEC → WGS84)
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - next/script: 스크립트 로드
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.4 지도 섹션)
 */

interface DetailMapProps {
  /** 관광지명 */
  title: string;
  /** 주소 */
  address: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * KATEC 좌표를 WGS84로 변환
 */
function convertKATECToWGS84(mapx: string, mapy: string) {
  const lng = parseFloat(mapx) / 10000000;
  const lat = parseFloat(mapy) / 10000000;
  return { lat, lng };
}

/**
 * 관광지 지도 섹션
 */
export function DetailMap({
  title,
  address,
  mapx,
  mapy,
  className,
}: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // 좌표 변환
  const { lat, lng } = convertKATECToWGS84(mapx, mapy);

  // 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || !(window as any).naver) {
      return;
    }

    const naver = (window as any).naver;

    try {
      // 지도 생성
      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 15,
      });

      // 마커 생성
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map,
        title,
      });

      // 인포윈도우 생성
      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              ${title}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${address}
            </p>
          </div>
        `,
      });

      // 마커 클릭 시 인포윈도우 열기
      naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(map, marker);
      });

      // 초기 인포윈도우 열기
      infoWindow.open(map, marker);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setIsMapReady(true);
    } catch (error) {
      console.error("지도 초기화 실패:", error);
    }
  }, [isScriptLoaded, lat, lng, title, address]);

  // 길찾기 버튼 클릭
  const handleDirections = () => {
    // 네이버 지도 길찾기 URL
    const url = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  if (!naverMapClientId) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              네이버 지도 API 키가 설정되지 않았습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapClientId}`}
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <Card className={cn("", className)}>
        <CardContent className="p-0">
          <div className="relative">
            <div
              ref={mapRef}
              className="min-h-[400px] w-full rounded-lg lg:min-h-[500px]"
            />
            {/* 길찾기 버튼 */}
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={handleDirections}
                className="gap-2 shadow-lg"
                size="lg"
              >
                <Navigation className="h-4 w-4" />
                길찾기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

