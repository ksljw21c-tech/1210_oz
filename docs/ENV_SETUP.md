# 환경변수 설정 가이드

이 문서는 My Trip 프로젝트의 환경변수 설정 방법을 설명합니다.

## 개요

My Trip 프로젝트는 다양한 외부 서비스를 사용하기 위해 여러 환경변수가 필요합니다. 모든 환경변수는 보안상 `.env` 파일에 저장되며, Git에 커밋되지 않습니다.

## 필수 환경변수 목록

### 한국관광공사 공공 API

```bash
# 한국관광공사 공공데이터포털에서 발급받은 API 키
# https://www.data.go.kr/data/15101578/openapi.do
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key

# 서버 사이드용 (폴백, 선택 사항)
TOUR_API_KEY=your_tour_api_key
```

**발급 방법**:
1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. "한국관광공사_국문 관광정보 서비스" 검색
3. "활용신청" 클릭
4. API 키 발급받기

### 네이버 지도 API

```bash
# 네이버 클라우드 플랫폼(NCP)에서 발급받은 Client ID
# https://console.ncloud.com/mc/solution/naverService/application
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

**발급 방법**:
1. [네이버 클라우드 플랫폼](https://console.ncloud.com/) 회원가입
2. "Maps" 서비스 신청
3. "Web Dynamic Map" 서비스 활성화
4. Client ID 발급받기

### Clerk Authentication

```bash
# Clerk 대시보드에서 발급받은 키들
# https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# 선택 사항: Clerk 리다이렉트 URL 설정
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

**발급 방법**:
1. [Clerk](https://dashboard.clerk.com/) 회원가입
2. 새 프로젝트 생성
3. "API Keys" 섹션에서 키 복사

### Supabase Database

```bash
# Supabase 프로젝트에서 발급받은 키들
# https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 선택 사항: 스토리지 버킷 이름
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**발급 방법**:
1. [Supabase](https://supabase.com/) 회원가입
2. 새 프로젝트 생성
3. "Settings" > "API"에서 URL과 키 복사

### SEO 및 메타데이터

```bash
# 배포된 애플리케이션의 URL (프로덕션 도메인)
# 예시: https://my-trip-app.vercel.app
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 환경변수 파일 생성

### 1. `.env` 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 위의 환경변수를 설정하세요.

```bash
# .env 파일 생성
cp .env.example .env
```

### 2. 환경변수 값 입력

각 서비스에서 발급받은 실제 키 값으로 `.env` 파일을 업데이트하세요.

**주의**: `.env` 파일은 절대 Git에 커밋하지 마세요. 이미 `.gitignore`에 포함되어 있습니다.

## Vercel 배포 시 환경변수 설정

### Vercel CLI 사용 시

```bash
# Vercel CLI 설치 (아직 설치하지 않은 경우)
npm install -g vercel

# Vercel 프로젝트 연결
vercel link

# 환경변수 설정
vercel env add NEXT_PUBLIC_TOUR_API_KEY
vercel env add TOUR_API_KEY
vercel env add NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### Vercel 대시보드 사용 시

1. [Vercel 대시보드](https://vercel.com/dashboard) 로그인
2. 프로젝트 선택
3. "Settings" > "Environment Variables" 탭
4. 각 환경변수 추가:
   - Name: 환경변수 이름
   - Value: 실제 값
   - Environment: Production (프로덕션용)

## 환경별 설정

### 개발 환경 (.env)
로컬 개발용으로 모든 환경변수 설정

### 스테이징 환경 (Vercel Preview)
Vercel에서 자동 생성되는 Preview 배포용
- 테스트용 API 키 사용 가능
- 실제 데이터 대신 테스트 데이터 사용

### 프로덕션 환경 (Vercel Production)
실제 서비스용
- 실제 API 키 사용
- 실제 Supabase 데이터베이스 사용

## 보안 주의사항

1. **API 키 노출 금지**:
   - `NEXT_PUBLIC_` 접두사가 없는 키는 서버 사이드에서만 사용
   - 클라이언트에 노출되지 않도록 주의

2. **키 회전**:
   - API 키가 유출된 경우 즉시 회전
   - 오래된 키는 정기적으로 교체

3. **접근 권한 제한**:
   - Clerk: 필요한 도메인만 허용
   - Supabase: RLS 정책으로 데이터 접근 제한
   - API 키: IP 제한 또는 도메인 제한 적용

## 검증 방법

환경변수가 올바르게 설정되었는지 확인하려면:

```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 다음 URL 확인
# - http://localhost:3000 (홈페이지 로딩 확인)
# - http://localhost:3000/stats (통계 데이터 로딩 확인)
# - http://localhost:3000/places/125266 (상세페이지 로딩 확인)
```

## 문제 해결

### API 키 관련 에러
- "API 키가 등록되지 않았습니다" → API 키 재발급
- "API 키가 유효하지 않습니다" → 키 값 확인

### Clerk 관련 에러
- "Invalid publishableKey" → Clerk 키 재발급
- 인증 페이지 리다이렉트 문제 → Clerk 대시보드 URL 설정 확인

### Supabase 관련 에러
- "Invalid API key" → Supabase 키 재발급
- 데이터베이스 연결 실패 → Supabase 프로젝트 상태 확인

### Vercel 배포 실패
- 환경변수 누락 → Vercel 대시보드에서 환경변수 확인
- 빌드 실패 → 로컬에서 `pnpm build` 테스트

## 추가 리소스

- [Next.js 환경변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel 환경변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [Clerk 환경변수 설정](https://clerk.com/docs/deployments/vercel)
- [Supabase 환경변수 설정](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
