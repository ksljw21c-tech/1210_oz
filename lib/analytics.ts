/**
 * @file analytics.ts
 * @description 웹 성능 및 분석 관련 유틸리티 함수들
 *
 * Web Vitals 측정, 사용자 행동 추적, 에러 로깅 등의 기능을 제공합니다.
 *
 * 주요 기능:
 * - Web Vitals 측정 및 리포팅
 * - 사용자 이벤트 추적
 * - 에러 로깅
 * - 분석 데이터 전송
 *
 * @dependencies
 * - Vercel Analytics (자동)
 * - Google Analytics 4 (선택 사항)
 */

/**
 * Web Vitals 측정 결과 타입
 */
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries: PerformanceEntry[];
  navigationType?: string;
}

/**
 * Web Vitals 측정 리포터 함수
 * Next.js App Router에서 자동으로 호출됩니다.
 *
 * @param metric - Web Vitals 측정 데이터
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // 개발 환경에서는 콘솔에 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  }

  // 프로덕션 환경에서는 분석 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Vercel Analytics가 자동으로 수집하므로 추가 설정 불필요
    // 필요 시 Google Analytics 4로 전송 가능

    // 예시: Google Analytics 4 전송
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', metric.name, {
    //     value: Math.round(metric.value),
    //     custom_map: { metric_rating: metric.rating },
    //     event_category: 'Web Vitals',
    //     event_label: metric.id,
    //   });
    // }
  }
}

/**
 * 사용자 이벤트 추적 함수
 * 버튼 클릭, 페이지 뷰 등의 사용자 행동을 추적합니다.
 *
 * @param eventName - 이벤트 이름
 * @param properties - 이벤트 속성 (선택 사항)
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Track Event:', eventName, properties);
  }

  // 프로덕션 환경에서 분석 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Vercel Analytics
    // Google Analytics 4 등으로 전송 가능

    // 예시: Google Analytics 4 전송
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', eventName, properties);
    // }
  }
}

/**
 * 에러 로깅 함수
 * 애플리케이션 에러를 중앙 집중적으로 로깅합니다.
 *
 * @param error - 에러 객체
 * @param context - 에러 발생 컨텍스트 (선택 사항)
 */
export function logError(error: Error, context?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...context,
  };

  // 개발 환경에서는 콘솔에 로깅
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorData);
  }

  // 프로덕션 환경에서는 에러 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket 등으로 전송 가능

    // 예시: Sentry 전송
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  }
}

/**
 * 페이지 뷰 추적 함수
 * 페이지 방문 시 호출하여 분석합니다.
 *
 * @param pagePath - 페이지 경로
 * @param properties - 추가 속성 (선택 사항)
 */
export function trackPageView(pagePath: string, properties?: Record<string, any>) {
  trackEvent('page_view', {
    page_path: pagePath,
    ...properties,
  });
}

/**
 * 사용자 상호작용 추적 함수
 * 버튼 클릭, 폼 제출 등의 사용자 상호작용을 추적합니다.
 *
 * @param action - 액션 이름
 * @param category - 카테고리 (예: 'button', 'form')
 * @param properties - 추가 속성 (선택 사항)
 */
export function trackInteraction(action: string, category: string, properties?: Record<string, any>) {
  trackEvent('user_interaction', {
    action,
    category,
    ...properties,
  });
}
