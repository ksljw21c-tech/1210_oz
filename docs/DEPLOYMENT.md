# 배포 가이드

이 문서는 My Trip 프로젝트의 Vercel 배포 방법을 설명합니다.

## 사전 준비사항

### 1. 환경변수 설정
`docs/ENV_SETUP.md`를 참고하여 모든 필수 환경변수를 설정하세요.

### 2. Vercel 계정
[Vercel](https://vercel.com/)에 가입하고 프로젝트를 생성하세요.

### 3. GitHub 연동
프로젝트를 GitHub에 푸시하고 Vercel과 연동하세요.

## Vercel CLI를 사용한 배포

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. 프로젝트 연결

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/my-trip-project

# Vercel에 로그인
vercel login

# 프로젝트 연결 (처음 한 번만)
vercel link
```

### 3. 환경변수 설정

```bash
# 각 환경변수를 개별적으로 설정
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

각 명령어 실행 시:
- **Value**: 실제 환경변수 값 입력
- **Environment**: Production 선택 (또는 Preview, Development)

### 4. 배포 실행

```bash
# 프로덕션 배포
vercel --prod

# 또는 미리보기 배포 (테스트용)
vercel
```

### 5. 배포 확인

배포가 완료되면 다음과 같은 정보를 확인할 수 있습니다:
- **배포 URL**: `https://my-trip-app.vercel.app` (또는 자동 생성된 URL)
- **배포 상태**: Vercel 대시보드에서 확인
- **빌드 로그**: 배포 중 발생한 문제 확인

## Vercel 대시보드를 사용한 배포

### 1. GitHub 연동

1. [Vercel 대시보드](https://vercel.com/dashboard) 로그인
2. "New Project" 클릭
3. GitHub 계정 연동
4. My Trip 프로젝트 선택

### 2. 프로젝트 설정

1. **Framework Preset**: Next.js 자동 감지됨
2. **Root Directory**: `./` (프로젝트 루트)
3. **Build Command**: `pnpm build` (자동 설정됨)
4. **Output Directory**: `.next` (자동 설정됨)

### 3. 환경변수 설정

1. 프로젝트 설정에서 "Environment Variables" 탭 선택
2. 다음 환경변수들을 추가:

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_TOUR_API_KEY | [실제 API 키] | Production |
| TOUR_API_KEY | [실제 API 키] | Production |
| NEXT_PUBLIC_NAVER_MAP_CLIENT_ID | [실제 Client ID] | Production |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | [실제 키] | Production |
| CLERK_SECRET_KEY | [실제 키] | Production |
| NEXT_PUBLIC_SUPABASE_URL | [실제 URL] | Production |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | [실제 키] | Production |
| SUPABASE_SERVICE_ROLE_KEY | [실제 키] | Production |
| NEXT_PUBLIC_APP_URL | `https://[프로젝트명].vercel.app` | Production |

### 4. 배포

1. "Deploy" 버튼 클릭
2. 빌드 완료까지 대기 (약 3-5분)
3. 배포된 URL에서 애플리케이션 확인

## 배포 후 검증

### 필수 확인 사항

#### 1. 기본 기능 테스트
- [ ] 홈페이지 로딩 (`/`)
- [ ] 관광지 목록 표시
- [ ] 필터링 기능 작동
- [ ] 검색 기능 작동

#### 2. 상세페이지 테스트
- [ ] 관광지 상세페이지 로딩 (`/places/[contentId]`)
- [ ] 지도 표시
- [ ] 북마크 기능
- [ ] 공유 기능

#### 3. 통계 페이지 테스트
- [ ] 통계 대시보드 로딩 (`/stats`)
- [ ] 차트 표시
- [ ] 데이터 로딩

#### 4. 북마크 페이지 테스트
- [ ] 북마크 목록 페이지 (`/bookmarks`)
- [ ] 인증 요구 확인
- [ ] 북마크 관리 기능

#### 5. SEO 기능 확인
- [ ] 메타태그 확인 (브라우저 개발자 도구)
- [ ] Sitemap 접근 (`/sitemap.xml`)
- [ ] Robots.txt 접근 (`/robots.txt`)

#### 6. 외부 서비스 연동 확인
- [ ] 네이버 지도 표시
- [ ] Clerk 인증 작동
- [ ] Supabase 데이터베이스 연결

### 성능 확인

#### Lighthouse 점수 측정
프로덕션 환경에서 Lighthouse를 실행하여 성능 점수를 확인하세요.

**목표 점수**:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 문제 해결

### 빌드 실패

#### 원인 1: 환경변수 누락
```
Error: Environment variable NEXT_PUBLIC_TOUR_API_KEY is not set
```

**해결**: Vercel 대시보드에서 모든 필수 환경변수를 설정하세요.

#### 원인 2: 타입 에러
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**해결**: 로컬에서 `pnpm build`를 실행하여 에러를 수정하세요.

#### 원인 3: 의존성 문제
```
Module not found: Can't resolve 'xxx'
```

**해결**: `pnpm install`을 실행하여 의존성을 재설치하세요.

### 런타임 에러

#### API 호출 실패
- 환경변수 값이 올바른지 확인
- API 키가 유효한지 확인
- 네트워크 제한이 있는지 확인

#### 인증 문제
- Clerk 키가 올바른지 확인
- 리다이렉트 URL 설정 확인

#### 데이터베이스 연결 실패
- Supabase URL과 키 확인
- RLS 정책 설정 확인

## 모니터링 및 유지보수

### Vercel Analytics
Vercel 대시보드에서 Analytics를 활성화하여 사용자 행동을 모니터링하세요.

### 에러 모니터링
- Vercel Functions 로그 확인
- 브라우저 콘솔 에러 확인
- API 응답 상태 확인

### 성능 모니터링
- 정기적으로 Lighthouse 점수 측정
- Core Web Vitals 모니터링
- 페이지 로딩 시간 확인

## 롤백

문제가 발생한 경우 이전 배포로 롤백할 수 있습니다:

1. Vercel 대시보드에서 프로젝트 선택
2. "Deployments" 탭에서 이전 배포 선택
3. "Rollback to this deployment" 클릭

## 추가 설정 (선택 사항)

### 커스텀 도메인
1. 도메인 구매 (예: Namecheap, GoDaddy)
2. Vercel 대시보드에서 "Settings" > "Domains"
3. 도메인 추가 및 DNS 설정

### CDN 설정
Vercel은 자동으로 글로벌 CDN을 제공하므로 추가 설정이 필요하지 않습니다.

### 백업 전략
- 코드: GitHub에 자동 백업
- 데이터: Supabase 자동 백업 활용
- 설정: 환경변수 별도 관리

## 지원

문제가 발생하면 다음 자료를 참고하세요:
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk Vercel 가이드](https://clerk.com/docs/deployments/vercel)
- [Supabase 배포 가이드](https://supabase.com/docs/guides/hosting/vercel)
