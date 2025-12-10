"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 지도 API를 사용하여 관광지 위치를 지도에 표시하는 컴포넌트입니다.
 * 마커 클릭 시 인포윈도우를 표시하고, 리스트와 연동됩니다.
 *
 * 주요 기능:
 * - 네이버 지도 초기화
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우
 * - 리스트-지도 연동
 * - 좌표 변환 (KATEC → WGS84)
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - next/script: 스크립트 로드
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.2 네이버 지도 연동)
 */

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 */
  selectedTour?: TourItem | null;
  /** 관광지 선택 콜백 */
  onTourSelect?: (tour: TourItem) => void;
  /** 초기 중심 좌표 */
  initialCenter?: { lat: number; lng: number };
  /** 초기 줌 레벨 */
  initialZoom?: number;
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
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedTour,
  onTourSelect,
  initialCenter = { lat: 37.5665, lng: 126.9780 }, // 서울 중심
  initialZoom = 10,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || !(window as any).naver) {
      return;
    }

    const naver = (window as any).naver;

    try {
      // 지도 생성
      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
        zoom: initialZoom,
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    } catch (error) {
      console.error("지도 초기화 실패:", error);
    }
  }, [isScriptLoaded, initialCenter.lat, initialCenter.lng, initialZoom]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !(window as any).naver) {
      return;
    }

    const naver = (window as any).naver;
    const map = mapInstanceRef.current as any;

    // 기존 마커 및 인포윈도우 제거
    markersRef.current.forEach((marker) => (marker as any).setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => (infoWindow as any).close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // 새 마커 생성
    tours.forEach((tour) => {
      if (!tour.mapx || !tour.mapy) {
        return;
      }

      const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
      const position = new naver.maps.LatLng(lat, lng);

      // 마커 생성
      const marker = new naver.maps.Marker({
        position,
        map,
        title: tour.title,
      }) as any;

      // 인포윈도우 생성
      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              ${tour.title}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              ${tour.addr1 || ""}
            </p>
            <a 
              href="/places/${tour.contentid}" 
              style="display: inline-block; padding: 4px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;"
            >
              상세보기
            </a>
          </div>
        `,
      }) as any;

      // 마커 클릭 이벤트
      naver.maps.Event.addListener(marker, "click", () => {
        // 다른 인포윈도우 닫기
        infoWindowsRef.current.forEach((iw) => (iw as any).close());

        // 현재 인포윈도우 열기
        infoWindow.open(map, marker);

        // 선택된 관광지 알림
        onTourSelect?.(tour);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    // 선택된 관광지가 있으면 해당 마커로 이동
    if (selectedTour) {
      const tour = tours.find((t) => t.contentid === selectedTour.contentid);
      if (tour && tour.mapx && tour.mapy) {
        const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
        map.setCenter(new naver.maps.LatLng(lat, lng));
        map.setZoom(15);

        // 해당 마커의 인포윈도우 열기
        const markerIndex = tours.findIndex(
          (t) => t.contentid === selectedTour.contentid
        );
        if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
          infoWindowsRef.current.forEach((iw) => (iw as any).close());
          (infoWindowsRef.current[markerIndex] as any).open(
            map,
            markersRef.current[markerIndex]
          );
        }
      }
    }
  }, [tours, selectedTour, isMapReady, onTourSelect]);

  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  if (!naverMapClientId) {
    return (
      <div
        className={cn(
          "flex min-h-[400px] items-center justify-center rounded-lg border bg-muted",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          네이버 지도 API 키가 설정되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapClientId}`}
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <div
        ref={mapRef}
        className={cn(
          "min-h-[400px] w-full rounded-lg border lg:min-h-[600px]",
          className
        )}
      />
    </>
  );
}

