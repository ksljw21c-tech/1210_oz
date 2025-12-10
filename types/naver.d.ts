/**
 * @file naver.d.ts
 * @description 네이버 지도 API 타입 정의
 *
 * 네이버 지도 JavaScript API v3 (NCP)의 타입 정의입니다.
 */

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    setCenter(center: LatLng): void;
    setZoom(zoom: number): void;
    setMapTypeId(mapTypeId: string): void;
  }

  interface MapOptions {
    center: LatLng;
    zoom: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    position: LatLng;
    map: Map;
    title?: string;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  interface InfoWindowOptions {
    content: string;
  }

  namespace Event {
    function addListener(
      target: Marker,
      event: string,
      handler: () => void
    ): void;
  }
}

declare const naver: {
  maps: typeof naver.maps;
};

