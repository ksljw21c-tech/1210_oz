/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 이 파일은 한국관광공사 공공 API (KorService2)를 호출하는 클라이언트 라이브러리입니다.
 * 모든 API 호출에 공통으로 적용되는 파라미터 처리, 에러 처리, 재시도 로직을 포함합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (getAreaCode)
 * 2. 지역 기반 관광지 목록 조회 (getAreaBasedList)
 * 3. 키워드 검색 (searchKeyword)
 * 4. 관광지 상세 정보 조회 (getDetailCommon)
 * 5. 관광지 운영 정보 조회 (getDetailIntro)
 * 6. 관광지 이미지 목록 조회 (getDetailImage)
 * 7. 반려동물 동반 여행 정보 조회 (getDetailPetTour)
 *
 * 핵심 구현 로직:
 * - 공통 파라미터 자동 추가 (serviceKey, MobileOS, MobileApp, _type)
 * - 재시도 로직 (최대 3회, 지수 백오프)
 * - 타임아웃 처리 (기본 10초)
 * - 에러 처리 및 사용자 친화적 메시지 변환
 *
 * @dependencies
 * - 한국관광공사 공공 API: https://www.data.go.kr/data/15101578/openapi.do
 * - lib/types/tour.ts: API 응답 타입 정의
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  AreaCode,
  ApiResponse,
  TourListResponse,
  TourDetailResponse,
  TourIntroResponse,
  TourImageResponse,
  PetTourInfoResponse,
  AreaCodeResponse,
  ArrangeType,
} from "@/lib/types/tour";

// =====================================================
// 상수 정의
// =====================================================

/** API Base URL */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/** 공통 파라미터 고정값 */
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

/** 기본 타임아웃 (밀리초) */
const DEFAULT_TIMEOUT = 10000;

/** 최대 재시도 횟수 */
const MAX_RETRIES = 3;

// =====================================================
// 환경변수 확인
// =====================================================

/**
 * API 키를 환경변수에서 가져옵니다.
 * NEXT_PUBLIC_TOUR_API_KEY를 우선 확인하고, 없으면 TOUR_API_KEY를 확인합니다.
 *
 * @throws {Error} 환경변수가 설정되지 않은 경우
 */
function getApiKey(): string {
  const clientKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;
  const serverKey = process.env.TOUR_API_KEY;

  if (clientKey) {
    return clientKey;
  }

  if (serverKey) {
    return serverKey;
  }

  throw new Error(
    "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 설정해주세요."
  );
}

// =====================================================
// 타입 정의
// =====================================================

/** API 공통 파라미터 */
interface TourApiParams {
  serviceKey: string;
  MobileOS: "ETC";
  MobileApp: "MyTrip";
  _type: "json";
  [key: string]: string | number | undefined;
}

/** 지역코드 조회 파라미터 */
interface GetAreaCodeParams {
  numOfRows?: number;
  pageNo?: number;
  areaCode?: string;
}

/** 지역 기반 목록 조회 파라미터 */
interface GetAreaBasedListParams {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  arrange?: ArrangeType;
}

/** 키워드 검색 파라미터 */
interface SearchKeywordParams {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  arrange?: ArrangeType;
}

/** 상세 정보 조회 파라미터 */
interface GetDetailCommonParams {
  contentId: string;
  contentTypeId?: string;
  overviewYN?: "Y" | "N";
}

/** 운영 정보 조회 파라미터 */
interface GetDetailIntroParams {
  contentId: string;
  contentTypeId: string;
}

/** 이미지 목록 조회 파라미터 */
interface GetDetailImageParams {
  contentId: string;
  imageYN?: "Y" | "N";
  subImageYN?: "Y" | "N";
}

/** 반려동물 정보 조회 파라미터 */
interface GetDetailPetTourParams {
  contentId: string;
}

// =====================================================
// 커스텀 에러 클래스
// =====================================================

/**
 * 한국관광공사 API 에러 클래스
 */
export class TourApiError extends Error {
  /** API 에러 코드 */
  code: string;
  /** HTTP 상태 코드 */
  statusCode: number;
  /** 원본 에러 */
  originalError?: unknown;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    statusCode: number = 500,
    originalError?: unknown
  ) {
    super(message);
    this.name = "TourApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Error 클래스의 프로토타입 체인 유지
    Object.setPrototypeOf(this, TourApiError.prototype);
  }

  /**
   * 사용자 친화적인 에러 메시지 반환
   */
  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}

// =====================================================
// 공통 유틸리티 함수
// =====================================================

/**
 * URL 쿼리 파라미터를 생성합니다.
 * 공통 파라미터를 자동으로 추가하고, 선택적 파라미터를 병합합니다.
 *
 * @param params - API 파라미터 객체
 * @returns URLSearchParams 객체
 */
function buildQueryParams(
  params: Record<string, string | number | undefined>
): URLSearchParams {
  const serviceKey = getApiKey();
  const queryParams = new URLSearchParams();

  // 공통 파라미터 추가
  queryParams.set("serviceKey", serviceKey);
  queryParams.set("MobileOS", COMMON_PARAMS.MobileOS);
  queryParams.set("MobileApp", COMMON_PARAMS.MobileApp);
  queryParams.set("_type", COMMON_PARAMS._type);

  // 선택적 파라미터 추가 (빈 값 제외)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  }

  return queryParams;
}

/**
 * 지연 함수 (재시도 로직용)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도 로직이 포함된 fetch 래퍼
 * 네트워크 에러 시 최대 3회 재시도하며, 지수 백오프를 적용합니다.
 *
 * @param url - 요청 URL
 * @param options - fetch 옵션
 * @param maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @param timeout - 타임아웃 (밀리초, 기본값: 10000)
 * @returns fetch 응답
 * @throws {TourApiError} 네트워크 에러 또는 타임아웃
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = MAX_RETRIES,
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 타임아웃을 위한 AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // HTTP 에러 상태 코드 처리
        if (!response.ok) {
          throw new TourApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            `HTTP_${response.status}`,
            response.status
          );
        }

        return response;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      lastError = error as Error;

      // AbortError는 타임아웃 에러
      if (error instanceof Error && error.name === "AbortError") {
        throw new TourApiError(
          "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
          "TIMEOUT_ERROR",
          408,
          error
        );
      }

      // 마지막 시도가 아니면 재시도
      if (attempt < maxRetries) {
        // 지수 백오프: 1초, 2초, 4초...
        const delayMs = Math.pow(2, attempt) * 1000;
        await delay(delayMs);
        continue;
      }
    }
  }

  // 모든 재시도 실패
  throw new TourApiError(
    `네트워크 요청이 실패했습니다. (${maxRetries + 1}회 시도)`,
    "NETWORK_ERROR",
    500,
    lastError
  );
}

/**
 * API 응답을 파싱하고 에러를 처리합니다.
 *
 * @param response - fetch 응답
 * @returns 파싱된 API 응답 데이터
 * @throws {TourApiError} API 에러 또는 파싱 에러
 */
async function parseApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  try {
    // 응답 텍스트를 먼저 가져와서 확인
    const responseText = await response.text();
    
    // 빈 응답 처리
    if (!responseText || responseText.trim() === "") {
      throw new TourApiError(
        "API 응답이 비어있습니다. API 키를 확인해주세요.",
        "EMPTY_RESPONSE",
        response.status
      );
    }

    let data: ApiResponse<T> | any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // JSON 파싱 실패 시 원본 텍스트를 로깅
      const preview = responseText.length > 500 
        ? responseText.substring(0, 500) + "..."
        : responseText;
      
      console.error("API 응답 파싱 실패:", {
        status: response.status,
        statusText: response.statusText,
        responseText: preview,
      });
      
      throw new TourApiError(
        "API 응답 형식이 올바르지 않습니다. API 키와 서비스 상태를 확인해주세요.",
        "INVALID_JSON",
        response.status,
        parseError
      );
    }

    // 응답 구조 확인
    if (data === null || data === undefined) {
      const preview = responseText.length > 500 
        ? responseText.substring(0, 500) + "..."
        : responseText;
      
      console.error("API 응답이 null 또는 undefined입니다:", {
        status: response.status,
        statusText: response.statusText,
        responseText: preview,
      });
      
      throw new TourApiError(
        "API 응답이 비어있습니다. API 키와 서비스 상태를 확인해주세요.",
        "EMPTY_RESPONSE",
        response.status
      );
    }

    // data가 객체인지 확인
    if (typeof data !== "object" || data === null) {
      const preview = responseText.length > 500 
        ? responseText.substring(0, 500) + "..."
        : responseText;
      
      console.error("API 응답이 객체가 아닙니다:", {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof data,
        dataValue: String(data),
        responseText: preview,
      });
      
      throw new TourApiError(
        "API 응답 형식이 올바르지 않습니다. API 키와 서비스 상태를 확인해주세요.",
        "INVALID_RESPONSE_STRUCTURE",
        response.status
      );
    }

    // response 필드 확인
    if (!data.response) {
      // 에러 응답 형식 확인 (resultCode, resultMsg가 있는 경우)
      if (
        typeof data === "object" &&
        data !== null &&
        ("resultCode" in data || "resultMsg" in data)
      ) {
        const errorCode = (data as any).resultCode || "UNKNOWN";
        const errorMsg =
          (data as any).resultMsg || "알 수 없는 오류가 발생했습니다.";

        // 자주 발생하는 에러 코드에 대한 친화적인 메시지
        let friendlyMessage = errorMsg;
        if (errorCode === "SERVICE_KEY_IS_NOT_REGISTERED") {
          friendlyMessage = "API 키가 등록되지 않았습니다. 환경변수를 확인해주세요.";
        } else if (errorCode === "SERVICE_KEY_IS_NOT_VALID") {
          friendlyMessage = "API 키가 유효하지 않습니다. API 키를 확인해주세요.";
        } else if (errorCode === "NO_DATA") {
          friendlyMessage = "조회된 데이터가 없습니다. 다른 조건으로 검색해보세요.";
        }

        console.error("API 에러 응답 (직접 형식):", {
          status: response.status,
          statusText: response.statusText,
          errorCode,
          errorMsg,
          responseTime: (data as any).responseTime,
        });

        throw new TourApiError(friendlyMessage, String(errorCode), response.status);
      }

      // response 필드가 없고 에러 형식도 아닌 경우
      const preview = responseText.length > 500 
        ? responseText.substring(0, 500) + "..."
        : responseText;
      
      // data의 키 목록 안전하게 추출
      const dataKeys = Object.keys(data);
      
      // dataValue를 안전하게 직렬화 (순환 참조 방지)
      let dataValuePreview: string;
      try {
        dataValuePreview = JSON.stringify(data, null, 2).substring(0, 500);
      } catch {
        dataValuePreview = "[직렬화 불가능한 객체]";
      }
      
      console.error("API 응답 구조 오류 (response 필드 없음):", {
        status: response.status,
        statusText: response.statusText,
        dataKeys,
        dataType: typeof data,
        dataValuePreview,
        responseText: preview,
      });
      
      throw new TourApiError(
        `API 응답 구조가 올바르지 않습니다. (필드: ${dataKeys.join(", ") || "없음"}) API 서비스 상태를 확인해주세요.`,
        "INVALID_RESPONSE_STRUCTURE",
        response.status
      );
    }

    // API 에러 코드 확인
    const resultCode = data.response?.header?.resultCode;
    if (resultCode !== "0000") {
      const errorCode = resultCode || "UNKNOWN";
      const errorMsg =
        data.response?.header?.resultMsg || "알 수 없는 오류가 발생했습니다.";

      // 자주 발생하는 에러 코드에 대한 친화적인 메시지
      let friendlyMessage = errorMsg;
      if (errorCode === "SERVICE_KEY_IS_NOT_REGISTERED") {
        friendlyMessage = "API 키가 등록되지 않았습니다. 환경변수를 확인해주세요.";
      } else if (errorCode === "SERVICE_KEY_IS_NOT_VALID") {
        friendlyMessage = "API 키가 유효하지 않습니다. API 키를 확인해주세요.";
      } else if (errorCode === "NO_DATA") {
        friendlyMessage = "조회된 데이터가 없습니다. 다른 조건으로 검색해보세요.";
      }

      console.error("API 에러 응답:", {
        errorCode,
        errorMsg,
        status: response.status,
        response: data.response,
      });

      throw new TourApiError(
        `API 오류: ${friendlyMessage}`,
        errorCode,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("예상치 못한 에러:", error);
    throw new TourApiError(
      error instanceof Error
        ? `응답 처리 중 오류가 발생했습니다: ${error.message}`
        : "응답 처리 중 알 수 없는 오류가 발생했습니다.",
      "UNKNOWN_ERROR",
      response.status,
      error
    );
  }
}

// =====================================================
// API 함수 구현
// =====================================================

/**
 * 지역코드 조회
 * 시/도 단위의 지역 코드 목록을 조회합니다.
 *
 * @param params - 조회 파라미터
 * @returns 지역 코드 목록
 */
export async function getAreaCode(
  params: GetAreaCodeParams = {}
): Promise<AreaCodeResponse> {
  const queryParams = buildQueryParams({
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
    areaCode: params.areaCode,
  });

  const url = `${BASE_URL}/areaCode2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<AreaCode>(response);

  // items.item가 배열이 아닌 경우 배열로 변환
  const items = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : data.response.body.items.item
      ? [data.response.body.items.item]
      : [];

  return {
    response: {
      ...data.response,
      body: {
        ...data.response.body,
        items: {
          item: items,
        },
        totalCount: data.response.body.totalCount || items.length,
      },
    },
  };
}

/**
 * 지역 기반 관광지 목록 조회
 * 지역과 관광 타입을 기준으로 관광지 목록을 조회합니다.
 *
 * @param params - 조회 파라미터
 * @returns 관광지 목록
 */
export async function getAreaBasedList(
  params: GetAreaBasedListParams = {}
): Promise<TourListResponse> {
  const queryParams = buildQueryParams({
    areaCode: params.areaCode,
    contentTypeId: params.contentTypeId,
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
    arrange: params.arrange,
  });

  const url = `${BASE_URL}/areaBasedList2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<TourItem>(response);

  // items.item가 배열이 아닌 경우 배열로 변환
  const items = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : data.response.body.items.item
      ? [data.response.body.items.item]
      : [];

  return {
    response: {
      ...data.response,
      body: {
        ...data.response.body,
        items: {
          item: items,
        },
        totalCount: data.response.body.totalCount || items.length,
        pageNo: data.response.body.pageNo || params.pageNo || 1,
        numOfRows: data.response.body.numOfRows || params.numOfRows || 10,
      },
    },
  };
}

/**
 * 키워드 검색
 * 키워드로 관광지를 검색합니다.
 *
 * @param params - 검색 파라미터
 * @returns 검색 결과 목록
 * @throws {TourApiError} 빈 키워드인 경우
 */
export async function searchKeyword(
  params: SearchKeywordParams
): Promise<TourListResponse> {
  // 빈 키워드 검증
  if (!params.keyword || params.keyword.trim() === "") {
    throw new TourApiError(
      "검색 키워드를 입력해주세요.",
      "INVALID_KEYWORD",
      400
    );
  }

  const queryParams = buildQueryParams({
    keyword: encodeURIComponent(params.keyword.trim()),
    areaCode: params.areaCode,
    contentTypeId: params.contentTypeId,
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
    arrange: params.arrange,
  });

  const url = `${BASE_URL}/searchKeyword2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<TourItem>(response);

  // items.item가 배열이 아닌 경우 배열로 변환
  const items = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : data.response.body.items.item
      ? [data.response.body.items.item]
      : [];

  return {
    response: {
      ...data.response,
      body: {
        ...data.response.body,
        items: {
          item: items,
        },
        totalCount: data.response.body.totalCount || items.length,
        pageNo: data.response.body.pageNo || params.pageNo || 1,
        numOfRows: data.response.body.numOfRows || params.numOfRows || 10,
      },
    },
  };
}

/**
 * 관광지 상세 정보 조회
 * 관광지의 기본 정보를 조회합니다.
 *
 * @param params - 조회 파라미터
 * @returns 관광지 상세 정보 (없으면 null)
 * @throws {TourApiError} 잘못된 contentId인 경우
 */
export async function getDetailCommon(
  params: GetDetailCommonParams
): Promise<TourDetail | null> {
  // contentId 검증 (숫자 문자열)
  if (!params.contentId || !/^\d+$/.test(params.contentId)) {
    throw new TourApiError(
      "올바른 관광지 ID를 입력해주세요.",
      "INVALID_CONTENT_ID",
      400
    );
  }

  const queryParams = buildQueryParams({
    contentId: params.contentId,
    contentTypeId: params.contentTypeId,
    overviewYN: params.overviewYN || "Y",
  });

  const url = `${BASE_URL}/detailCommon2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<TourDetail>(response);

  // items.item가 없거나 빈 배열인 경우 null 반환
  if (!data.response.body.items.item) {
    return null;
  }

  const item = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item[0]
    : data.response.body.items.item;

  return item || null;
}

/**
 * 관광지 운영 정보 조회
 * 관광지의 운영 시간, 휴무일, 요금 등 운영 정보를 조회합니다.
 *
 * @param params - 조회 파라미터
 * @returns 관광지 운영 정보 (없으면 null)
 * @throws {TourApiError} contentTypeId가 없는 경우
 */
export async function getDetailIntro(
  params: GetDetailIntroParams
): Promise<TourIntro | null> {
  // contentTypeId 필수 검증
  if (!params.contentTypeId) {
    throw new TourApiError(
      "관광 타입 ID가 필요합니다.",
      "MISSING_CONTENT_TYPE_ID",
      400
    );
  }

  // contentId 검증
  if (!params.contentId || !/^\d+$/.test(params.contentId)) {
    throw new TourApiError(
      "올바른 관광지 ID를 입력해주세요.",
      "INVALID_CONTENT_ID",
      400
    );
  }

  const queryParams = buildQueryParams({
    contentId: params.contentId,
    contentTypeId: params.contentTypeId,
  });

  const url = `${BASE_URL}/detailIntro2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<TourIntro>(response);

  // items.item가 없거나 빈 배열인 경우 null 반환
  if (!data.response.body.items.item) {
    return null;
  }

  const item = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item[0]
    : data.response.body.items.item;

  return item || null;
}

/**
 * 관광지 이미지 목록 조회
 * 관광지의 대표 이미지와 서브 이미지 목록을 조회합니다.
 *
 * @param params - 조회 파라미터
 * @returns 이미지 목록 (없으면 빈 배열)
 */
export async function getDetailImage(
  params: GetDetailImageParams
): Promise<TourImage[]> {
  // contentId 검증
  if (!params.contentId || !/^\d+$/.test(params.contentId)) {
    throw new TourApiError(
      "올바른 관광지 ID를 입력해주세요.",
      "INVALID_CONTENT_ID",
      400
    );
  }

  const queryParams = buildQueryParams({
    contentId: params.contentId,
    imageYN: params.imageYN || "Y",
    subImageYN: params.subImageYN || "Y",
  });

  const url = `${BASE_URL}/detailImage2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<TourImage>(response);

  // items.item가 없거나 빈 배열인 경우 빈 배열 반환
  if (!data.response.body.items.item) {
    return [];
  }

  const items = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : [data.response.body.items.item];

  // 이미지 URL 유효성 검증 (http:// 또는 https://로 시작하는지 확인)
  return items.filter(
    (img) =>
      img.originimgurl &&
      (img.originimgurl.startsWith("http://") ||
        img.originimgurl.startsWith("https://"))
  );
}

/**
 * 반려동물 동반 여행 정보 조회
 * 관광지의 반려동물 동반 가능 여부 및 관련 정보를 조회합니다.
 *
 * @param params - 조회 파라미터
 * @returns 반려동물 정보 (없으면 null)
 */
export async function getDetailPetTour(
  params: GetDetailPetTourParams
): Promise<PetTourInfo | null> {
  // contentId 검증
  if (!params.contentId || !/^\d+$/.test(params.contentId)) {
    throw new TourApiError(
      "올바른 관광지 ID를 입력해주세요.",
      "INVALID_CONTENT_ID",
      400
    );
  }

  const queryParams = buildQueryParams({
    contentId: params.contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${queryParams.toString()}`;
  const response = await fetchWithRetry(url);
  const data = await parseApiResponse<PetTourInfo>(response);

  // items.item가 없거나 빈 배열인 경우 null 반환
  if (!data.response.body.items.item) {
    return null;
  }

  const item = Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item[0]
    : data.response.body.items.item;

  return item || null;
}

