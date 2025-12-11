/**
 * @file tour.ts
 * @description 한국관광공사 API 관광지 관련 타입 정의
 *
 * 이 파일은 한국관광공사 공공 API (KorService2)의 응답 데이터 구조를
 * TypeScript 타입으로 정의합니다.
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 항목 (areaBasedList2, searchKeyword2)
 * - TourDetail: 관광지 상세 정보 (detailCommon2)
 * - TourIntro: 관광지 운영 정보 (detailIntro2, 타입별로 필드 다름)
 * - TourImage: 관광지 이미지 정보 (detailImage2)
 * - PetTourInfo: 반려동물 동반 여행 정보 (detailPetTour2)
 * - AreaCode: 지역 코드 정보 (areaCode2)
 *
 * @dependencies
 * - 한국관광공사 공공 API: https://www.data.go.kr/data/15101578/openapi.do
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 (시/도) */
  areacode: string;
  /** 콘텐츠ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠타입ID (12: 관광지, 14: 문화시설, 15: 축제/행사, 25: 여행코스, 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 (YYYYMMDD 형식) */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명문) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * 타입별로 필드 구조가 다르므로 공통 필드만 정의
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 가능 여부 */
  chkbabycarriage?: string;
  /** 장애인 편의시설 */
  chkcreditcard?: string;
  /** 기타 타입별 필드들 */
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 이미지 원본 URL */
  originimgurl: string;
  /** 이미지 썸네일 URL */
  smallimageurl: string;
  /** 이미지 설명 */
  imgname?: string;
  /** 이미지 순서 */
  serialnum?: string;
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 애완동물 동반 여부 */
  chkpetleash?: string;
  /** 애완동물 크기 제한 */
  chkpetsize?: string;
  /** 입장 가능 장소 (실내/실외) */
  chkpetplace?: string;
  /** 반려동물 동반 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
  /** 주차장 정보 */
  parking?: string;
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  /** 지역코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 순번 */
  rnum?: number;
}

/**
 * API 응답 공통 구조
 */
export interface ApiResponse<T> {
  /** 응답 헤더 */
  response: {
    header: {
      /** 결과 코드 ("0000"이면 성공) */
      resultCode: string;
      /** 결과 메시지 */
      resultMsg: string;
    };
    /** 응답 본문 */
    body: {
      /** 데이터 항목 */
      items: {
        /** 항목 배열 (단일 객체일 수도 있음) */
        item: T | T[];
      };
      /** 전체 개수 */
      totalCount?: number;
      /** 페이지 번호 */
      pageNo?: number;
      /** 페이지당 항목 수 */
      numOfRows?: number;
    };
  };
}

/**
 * 관광지 목록 응답 타입
 */
export type TourListResponse = ApiResponse<TourItem>;

/**
 * 관광지 상세 정보 응답 타입
 */
export type TourDetailResponse = ApiResponse<TourDetail>;

/**
 * 관광지 운영 정보 응답 타입
 */
export type TourIntroResponse = ApiResponse<TourIntro>;

/**
 * 관광지 이미지 목록 응답 타입
 */
export type TourImageResponse = ApiResponse<TourImage>;

/**
 * 반려동물 정보 응답 타입
 */
export type PetTourInfoResponse = ApiResponse<PetTourInfo>;

/**
 * 지역 코드 목록 응답 타입
 */
export type AreaCodeResponse = ApiResponse<AreaCode>;

/**
 * 지역 코드 목록 응답 (파싱 후)
 */
export interface AreaCodeListResponse {
  items: AreaCode[];
  totalCount: number;
}

/**
 * 관광지 목록 응답 (파싱 후)
 */
export interface TourListData {
  items: TourItem[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}

/**
 * Content Type ID 상수
 */
export const CONTENT_TYPE = {
  /** 관광지 */
  TOURIST_SPOT: "12",
  /** 문화시설 */
  CULTURAL_FACILITY: "14",
  /** 축제/행사 */
  FESTIVAL: "15",
  /** 여행코스 */
  TOUR_COURSE: "25",
  /** 레포츠 */
  LEISURE_SPORTS: "28",
  /** 숙박 */
  ACCOMMODATION: "32",
  /** 쇼핑 */
  SHOPPING: "38",
  /** 음식점 */
  RESTAURANT: "39",
} as const;

/**
 * Content Type ID 타입
 */
export type ContentTypeId =
  | typeof CONTENT_TYPE.TOURIST_SPOT
  | typeof CONTENT_TYPE.CULTURAL_FACILITY
  | typeof CONTENT_TYPE.FESTIVAL
  | typeof CONTENT_TYPE.TOUR_COURSE
  | typeof CONTENT_TYPE.LEISURE_SPORTS
  | typeof CONTENT_TYPE.ACCOMMODATION
  | typeof CONTENT_TYPE.SHOPPING
  | typeof CONTENT_TYPE.RESTAURANT;

/**
 * Content Type 이름 매핑
 */
export const CONTENT_TYPE_NAME: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOURIST_SPOT]: "관광지",
  [CONTENT_TYPE.CULTURAL_FACILITY]: "문화시설",
  [CONTENT_TYPE.FESTIVAL]: "축제/행사",
  [CONTENT_TYPE.TOUR_COURSE]: "여행코스",
  [CONTENT_TYPE.LEISURE_SPORTS]: "레포츠",
  [CONTENT_TYPE.ACCOMMODATION]: "숙박",
  [CONTENT_TYPE.SHOPPING]: "쇼핑",
  [CONTENT_TYPE.RESTAURANT]: "음식점",
};

/**
 * 정렬 옵션
 */
export const ARRANGE = {
  /** 제목순 */
  TITLE: "A",
  /** 조회순 */
  VIEW: "B",
  /** 수정일순 */
  MODIFIED: "C",
  /** 거리순 */
  DISTANCE: "D",
} as const;

/**
 * 정렬 옵션 타입
 */
export type ArrangeType =
  | typeof ARRANGE.TITLE
  | typeof ARRANGE.VIEW
  | typeof ARRANGE.MODIFIED
  | typeof ARRANGE.DISTANCE;

