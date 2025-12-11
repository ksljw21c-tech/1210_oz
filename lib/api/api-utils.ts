import { NextResponse } from "next/server";

/**
 * @file api-utils.ts
 * @description API Route 공통 유틸리티 함수
 *
 * API Route에서 사용할 에러 처리 및 응답 생성 함수들입니다.
 * 표준화된 에러 응답 형식을 제공합니다.
 */

/**
 * 표준화된 API 에러 응답 인터페이스
 */
export interface ApiErrorResponse {
  /** 사용자 친화적인 에러 메시지 */
  error: string;
  /** 에러 코드 (선택) */
  code?: string;
  /** 상세 정보 (개발 환경에서만) */
  details?: any;
}

/**
 * 표준화된 API 성공 응답 인터페이스
 */
export interface ApiSuccessResponse<T = any> {
  /** 성공 여부 */
  success?: boolean;
  /** 응답 데이터 */
  data?: T;
  /** 추가 메시지 */
  message?: string;
}

/**
 * API 에러 응답 생성
 *
 * @param message - 사용자 친화적인 에러 메시지
 * @param status - HTTP 상태 코드
 * @param code - 에러 코드 (선택)
 * @param details - 상세 정보 (개발 환경에서만 포함)
 * @returns NextResponse 객체
 */
export function createApiErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = { error: message };

  if (code) {
    response.code = code;
  }

  // 개발 환경에서만 상세 정보 포함
  if (process.env.NODE_ENV === "development" && details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * API 성공 응답 생성
 *
 * @param data - 응답 데이터
 * @param message - 추가 메시지 (선택)
 * @param status - HTTP 상태 코드 (기본: 200)
 * @returns NextResponse 객체
 */
export function createApiSuccessResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {};

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * 인증 에러 응답 생성
 *
 * @param message - 사용자 친화적인 메시지 (기본값: "인증이 필요합니다.")
 * @returns NextResponse 객체 (401)
 */
export function createAuthErrorResponse(
  message: string = "인증이 필요합니다."
): NextResponse<ApiErrorResponse> {
  return createApiErrorResponse(message, 401, "AUTH_REQUIRED");
}

/**
 * 유효성 검증 에러 응답 생성
 *
 * @param message - 사용자 친화적인 메시지
 * @param field - 검증 실패한 필드명 (선택)
 * @returns NextResponse 객체 (400)
 */
export function createValidationErrorResponse(
  message: string,
  field?: string
): NextResponse<ApiErrorResponse> {
  const code = field ? `VALIDATION_${field.toUpperCase()}` : "VALIDATION_ERROR";
  return createApiErrorResponse(message, 400, code);
}

/**
 * 서버 에러 응답 생성
 *
 * @param message - 사용자 친화적인 메시지 (기본값: "서버 오류가 발생했습니다.")
 * @param error - 원본 에러 객체 (개발 환경에서만 상세 정보 포함)
 * @returns NextResponse 객체 (500)
 */
export function createServerErrorResponse(
  message: string = "서버 오류가 발생했습니다.",
  error?: any
): NextResponse<ApiErrorResponse> {
  return createApiErrorResponse(message, 500, "SERVER_ERROR", error);
}

/**
 * 리소스 없음 에러 응답 생성
 *
 * @param resource - 찾을 수 없는 리소스명 (예: "사용자", "관광지")
 * @returns NextResponse 객체 (404)
 */
export function createNotFoundErrorResponse(
  resource: string
): NextResponse<ApiErrorResponse> {
  return createApiErrorResponse(
    `${resource}을(를) 찾을 수 없습니다.`,
    404,
    "NOT_FOUND"
  );
}

/**
 * API Route 공통 에러 핸들러
 *
 * @param error - 발생한 에러
 * @param context - 에러가 발생한 컨텍스트 (로깅용)
 * @returns NextResponse 객체
 */
export function handleApiError(
  error: any,
  context?: string
): NextResponse<ApiErrorResponse> {
  // 에러 로깅
  const logMessage = context ? `${context} 에러:` : "API 에러:";
  console.error(logMessage, error);

  // 특정 에러 타입에 따른 처리
  if (error?.code === "PGRST116") {
    // Supabase "not found" 에러
    return createNotFoundErrorResponse("요청한 데이터");
  }

  if (error?.code === "23505") {
    // Supabase 중복 키 에러
    return createValidationErrorResponse("이미 존재하는 데이터입니다.");
  }

  if (error?.message?.includes("JWT")) {
    // JWT 관련 에러
    return createAuthErrorResponse("인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.");
  }

  // 일반적인 서버 에러
  return createServerErrorResponse();
}
