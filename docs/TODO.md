- [ ] `.cursor/` 디렉토리
  - [ ] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [ ] `.github/` 디렉토리
- [ ] `.husky/` 디렉토리
- [ ] `app/` 디렉토리
  - [ ] `favicon.ico` 파일
  - [ ] `not-found.tsx` 파일
  - [ ] `robots.ts` 파일
  - [ ] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일
- [ ] `supabase/` 디렉토리
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리
  - [ ] `logo.png` 파일
  - [ ] `og-image.png` 파일
- [ ] `tsconfig.json` 파일
- [ ] `.cursorignore` 파일
- [ ] `.gitignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일
- [ ] `tsconfig.json` 파일
- [ ] `eslint.config.mjs` 파일
- [ ] `AGENTS.md` 파일

# My Trip - 개발 TODO 리스트

> PRD, Flowchart, Design 문서 기반 작업 항목 정리

## Phase 1: 기본 구조 & 공통 설정

- [ ] 프로젝트 셋업
  - [ ] 환경변수 설정 (`.env`)
    - [ ] `NEXT_PUBLIC_TOUR_API_KEY` (한국관광공사 API)
    - [ ] `TOUR_API_KEY` (서버 사이드용)
    - [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (네이버 지도)
    - [ ] Clerk 인증 키 확인
    - [ ] Supabase 키 확인
  - [ ] `.env.example` 파일 생성
- [x] API 클라이언트 구현
  - [x] `lib/api/tour-api.ts` 생성
    - [x] `getAreaCode()` - 지역코드 조회 (`areaCode2`)
    - [x] `getAreaBasedList()` - 지역 기반 목록 (`areaBasedList2`)
    - [x] `searchKeyword()` - 키워드 검색 (`searchKeyword2`)
    - [x] `getDetailCommon()` - 공통 정보 (`detailCommon2`)
    - [x] `getDetailIntro()` - 소개 정보 (`detailIntro2`)
    - [x] `getDetailImage()` - 이미지 목록 (`detailImage2`)
    - [x] `getDetailPetTour()` - 반려동물 정보 (`detailPetTour2`)
    - [x] 공통 파라미터 처리 (serviceKey, MobileOS, MobileApp, _type)
    - [x] 에러 처리 및 재시도 로직
  
  ---
  **상세 구현 계획 (plan 모드 build)**
  
  - [x] API 클라이언트 기본 구조 설정
    - [x] `lib/api/tour-api.ts` 파일 생성
    - [x] Base URL 상수 정의: `https://apis.data.go.kr/B551011/KorService2`
    - [x] 환경변수 확인 로직 (`NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY`)
    - [x] 공통 파라미터 타입 정의 (`TourApiParams` 인터페이스)
  
  - [x] 공통 유틸리티 함수 구현
    - [x] `buildQueryParams()` - URL 쿼리 파라미터 생성 함수
      - [x] 공통 파라미터 자동 추가 (serviceKey, MobileOS="ETC", MobileApp="MyTrip", _type="json")
      - [x] 선택적 파라미터 병합 처리
    - [x] `fetchWithRetry()` - 재시도 로직이 포함된 fetch 래퍼
      - [x] 최대 3회 재시도 (네트워크 에러 시)
      - [x] 지수 백오프 (exponential backoff) 적용
      - [x] 타임아웃 설정 (기본 10초)
    - [x] `parseApiResponse()` - API 응답 파싱 및 에러 처리
      - [x] JSON 응답 파싱
      - [x] API 에러 코드 확인 (response.header.resultCode !== "0000")
      - [x] 에러 메시지 추출 및 커스텀 에러 생성
  
  - [x] `getAreaCode()` 함수 구현
    - [x] 엔드포인트: `/areaCode2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp
    - [x] 선택 파라미터: numOfRows, pageNo, areaCode (시/도 코드)
    - [x] 반환 타입: `AreaCodeResponse` (지역 코드 목록)
    - [x] 에러 처리: 지역 코드 조회 실패 시 빈 배열 반환 또는 에러 throw
  
  - [x] `getAreaBasedList()` 함수 구현
    - [x] 엔드포인트: `/areaBasedList2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp
    - [x] 선택 파라미터: areaCode, contentTypeId, numOfRows, pageNo, arrange (정렬)
    - [x] 반환 타입: `TourListResponse` (관광지 목록 + totalCount)
    - [x] 정렬 옵션 지원: "A" (제목순), "B" (조회순), "C" (수정일순), "D" (거리순)
    - [x] 페이지네이션 지원 (numOfRows, pageNo)
  
  - [x] `searchKeyword()` 함수 구현
    - [x] 엔드포인트: `/searchKeyword2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp, keyword
    - [x] 선택 파라미터: areaCode, contentTypeId, numOfRows, pageNo, arrange
    - [x] 반환 타입: `TourListResponse` (검색 결과 목록)
    - [x] 키워드 URL 인코딩 처리
    - [x] 빈 키워드 검증 (빈 문자열 시 에러)
  
  - [x] `getDetailCommon()` 함수 구현
    - [x] 엔드포인트: `/detailCommon2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp, contentId
    - [x] 선택 파라미터: contentTypeId, defaultYN, firstImageYN, areacodeYN, catcodeYN, addrinfoYN, mapinfoYN, overviewYN
    - [x] 반환 타입: `TourDetailResponse` (상세 정보 단일 객체)
    - [x] contentId 검증 (숫자 문자열)
    - [x] 데이터 없을 경우 null 반환 처리
  
  - [x] `getDetailIntro()` 함수 구현
    - [x] 엔드포인트: `/detailIntro2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp, contentId, contentTypeId
    - [x] 반환 타입: `TourIntroResponse` (운영 정보, 타입별로 필드 다름)
    - [x] contentTypeId 필수 (타입별로 다른 필드 구조)
    - [x] 타입별 인터페이스 분리 (관광지, 문화시설, 축제 등)
  
  - [x] `getDetailImage()` 함수 구현
    - [x] 엔드포인트: `/detailImage2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp, contentId
    - [x] 선택 파라미터: imageYN, subImageYN
    - [x] 반환 타입: `TourImageResponse` (이미지 목록 배열)
    - [x] 이미지 URL 유효성 검증
    - [x] 이미지 없을 경우 빈 배열 반환
  
  - [x] `getDetailPetTour()` 함수 구현
    - [x] 엔드포인트: `/detailPetTour2`
    - [x] 필수 파라미터: serviceKey, MobileOS, MobileApp, contentId
    - [x] 반환 타입: `PetTourInfoResponse` (반려동물 정보)
    - [x] 반려동물 정보 없을 경우 null 반환
    - [x] 크기 제한, 입장 가능 장소 등 필드 파싱
  
  - [x] 에러 처리 전략
    - [x] 커스텀 에러 클래스 생성 (`TourApiError`)
      - [x] 에러 코드 (resultCode)
      - [x] 에러 메시지 (resultMsg)
      - [x] HTTP 상태 코드
    - [x] 네트워크 에러 처리 (fetch 실패)
    - [x] API 에러 응답 처리 (resultCode !== "0000")
    - [x] 타임아웃 에러 처리
    - [x] 사용자 친화적 에러 메시지 변환
  
  - [x] 타입 안정성 강화
    - [x] 모든 함수에 TypeScript 타입 정의
    - [x] API 응답 타입 정의 (response.body.items.item)
    - [x] 옵셔널 파라미터 처리 (Partial 타입 활용)
    - [x] 제네릭 타입 활용 (재사용성)
  
  - [ ] 테스트 및 검증
    - [ ] 각 API 함수 단위 테스트 (수동)
    - [ ] 에러 케이스 테스트 (잘못된 contentId, 빈 키워드 등)
    - [ ] 재시도 로직 테스트 (네트워크 에러 시뮬레이션)
    - [ ] 환경변수 누락 시 에러 처리 확인
- [x] 타입 정의
  - [x] `lib/types/tour.ts` 생성
    - [x] `TourItem` 인터페이스 (목록)
    - [x] `TourDetail` 인터페이스 (상세)
    - [x] `TourIntro` 인터페이스 (운영정보)
    - [x] `TourImage` 인터페이스 (이미지)
    - [x] `PetTourInfo` 인터페이스 (반려동물)
    - [x] `AreaCode` 인터페이스 (지역코드)
    - [x] API 응답 공통 구조 타입 (`ApiResponse<T>`)
    - [x] Content Type ID 상수 및 타입 정의
    - [x] 정렬 옵션 상수 및 타입 정의
  - [x] `lib/types/stats.ts` 생성
    - [x] `RegionStats` 인터페이스
    - [x] `TypeStats` 인터페이스
    - [x] `StatsSummary` 인터페이스
- [x] 레이아웃 구조
  - [x] `app/layout.tsx` 업데이트
    - [x] 메타데이터 설정 (My Trip 프로젝트에 맞게 업데이트)
    - [x] Open Graph 메타태그 추가
    - [x] Twitter Card 메타태그 추가
  - [x] `components/Navbar.tsx` 업데이트
    - [x] 로고 변경 (SaaS Template → My Trip)
    - [x] 네비게이션 링크 추가 (홈, 통계, 북마크)
    - [x] 아이콘 추가 (lucide-react)
    - [x] 반응형 디자인 (모바일에서 텍스트 숨김)
    - [x] sticky 헤더 적용
- [x] 공통 컴포넌트
  - [x] `components/ui/loading.tsx` - 로딩 스피너
    - [x] 크기 옵션 (sm, default, lg)
    - [x] 텍스트 표시 옵션
  - [x] `components/ui/skeleton.tsx` - 스켈레톤 UI
    - [x] 기본 Skeleton 컴포넌트
    - [x] SkeletonCard 컴포넌트
    - [x] SkeletonList 컴포넌트
  - [x] `components/ui/error.tsx` - 에러 메시지
    - [x] ErrorMessage 컴포넌트 (재시도 버튼 포함)
    - [x] InlineError 컴포넌트 (인라인 에러 메시지)
  - [ ] `components/ui/toast.tsx` - 토스트 알림 (shadcn/ui)
    - [ ] shadcn/ui toast 컴포넌트 설치 필요: `pnpx shadcn@latest add toast`

## Phase 2: 홈페이지 (`/`) - 관광지 목록

- [x] 페이지 기본 구조
  - [x] `app/page.tsx` 생성
    - [x] 기본 레이아웃 (헤더, 메인, 푸터)
    - [x] 반응형 컨테이너 설정
    - [x] 상태 관리 (필터, 검색, 관광지 목록, 로딩, 에러)
    - [x] API 호출 로직 (getAreaBasedList, searchKeyword)
- [x] 관광지 목록 기능 (MVP 2.1)
  - [x] `components/tour-card.tsx` 생성
    - [x] 썸네일 이미지 (기본 이미지 fallback)
    - [x] 관광지명
    - [x] 주소 표시
    - [x] 관광 타입 뱃지
    - [x] 소분류 표시 (cat3)
    - [x] 호버 효과 (scale, shadow)
    - [x] 클릭 시 상세페이지 이동
  - [x] `components/tour-list.tsx` 생성
    - [x] 그리드 레이아웃 (반응형: 모바일 1열, 태블릿 2열, 데스크톱 3열)
    - [x] 카드 목록 표시
    - [x] 로딩 상태 (Skeleton UI)
    - [x] 빈 상태 처리
    - [x] 에러 처리 및 재시도
  - [x] API 연동
    - [x] `getAreaBasedList()` 호출
    - [x] 데이터 파싱 및 표시
    - [x] 에러 처리
- [x] 필터 기능
  - [x] `components/tour-filters.tsx` 생성
    - [x] 지역 필터 (시/도 선택)
      - [x] `getAreaCode()` API로 지역 목록 로드
      - [x] Select 드롭다운 사용
      - [x] "전체" 옵션
    - [x] 관광 타입 필터
      - [x] 관광지(12), 문화시설(14), 축제/행사(15), 여행코스(25), 레포츠(28), 숙박(32), 쇼핑(38), 음식점(39)
      - [x] 다중 선택 가능 (Checkbox)
      - [x] "전체 선택/해제" 버튼
    - [x] 반려동물 동반 가능 필터 (MVP 2.5)
      - [x] 토글 버튼 (Switch)
      - [ ] 크기별 필터 (소형, 중형, 대형) - 향후 구현
    - [x] 정렬 옵션
      - [x] 최신순 (arrange="C")
      - [x] 이름순 (arrange="A")
      - [x] 조회순 (arrange="B")
    - [x] 필터 상태 관리 (useState)
    - [x] 필터 초기화 버튼
  - [x] 필터 적용 로직
    - [x] 필터 변경 시 API 재호출
    - [x] 필터 조합 처리
- [x] 검색 기능 (MVP 2.3)
  - [x] `components/tour-search.tsx` 생성
    - [x] 검색창 UI (메인 영역 상단)
    - [x] 검색 아이콘
    - [x] 엔터 또는 버튼 클릭으로 검색
    - [x] 검색 중 로딩 스피너
  - [x] 검색 API 연동
    - [x] `searchKeyword()` 호출
    - [x] 검색 결과 표시
    - [x] 검색 결과 개수 표시
    - [x] 결과 없음 메시지
  - [x] 검색 + 필터 조합
    - [x] 키워드 + 지역 필터
    - [x] 키워드 + 타입 필터
    - [x] 모든 필터 동시 적용
- [x] 네이버 지도 연동 (MVP 2.2)
  - [x] `components/naver-map.tsx` 생성
    - [x] Naver Maps API v3 초기화
    - [x] 지도 컨테이너 설정
    - [x] 초기 중심 좌표 설정 (서울 중심)
    - [x] 줌 레벨 설정 (기본값 10)
    - [x] Script 컴포넌트로 스크립트 로드
    - [x] 타입 정의 추가 (types/naver.d.ts)
  - [x] 마커 표시
    - [x] 관광지 목록을 마커로 표시
    - [x] 좌표 변환 (KATEC → WGS84: mapx/mapy / 10000000)
    - [x] 마커 클릭 시 인포윈도우
      - [x] 관광지명
      - [x] 주소 표시
      - [x] "상세보기" 버튼
    - [ ] 관광 타입별 마커 색상 구분 (선택 사항, 향후 구현)
  - [x] 지도-리스트 연동
    - [x] 선택된 관광지로 지도 이동 및 마커 강조
    - [ ] 리스트 항목 호버 → 마커 강조 (선택 사항, 향후 구현)
    - [x] 마커 클릭 → 관광지 선택
  - [ ] 지도 컨트롤
    - [ ] 줌 인/아웃 버튼 (향후 구현)
    - [ ] 지도 유형 선택 (일반/스카이뷰) (향후 구현)
    - [ ] 현재 위치 버튼 (선택 사항, 향후 구현)
  - [x] 반응형 레이아웃
    - [x] 데스크톱: 리스트(좌측 50%) + 지도(우측 50%) 분할
    - [x] 모바일: 세로 스택 레이아웃
    - [x] 지도 sticky 위치 (데스크톱)
- [ ] 페이지네이션
  - [ ] 무한 스크롤 구현
    - [ ] Intersection Observer 사용
    - [ ] 하단 로딩 인디케이터
    - [ ] 페이지당 10-20개 항목
  - [ ] 또는 페이지 번호 선택 방식
- [x] 최종 통합 및 스타일링
  - [x] 모든 기능 통합 테스트
  - [x] 반응형 디자인 확인 (모바일/태블릿/데스크톱)
  - [x] 로딩 상태 개선
  - [x] 에러 처리 개선

---

**상세 구현 계획 (plan 모드 build)**

- [x] shadcn/ui 컴포넌트 설치
  - [x] card 컴포넌트 설치
  - [x] badge 컴포넌트 설치
  - [x] select 컴포넌트 설치
  - [x] checkbox 컴포넌트 설치
  - [x] switch 컴포넌트 설치

- [x] tour-card.tsx 컴포넌트 구현
  - [x] Client Component 설정
  - [x] Link 컴포넌트로 상세페이지 연결
  - [x] Next.js Image 컴포넌트 사용 (이미지 최적화)
  - [x] 썸네일 이미지 표시 (기본 이미지 fallback)
  - [x] 관광지명 표시 (2줄 말줄임)
  - [x] 주소 표시 (MapPin 아이콘)
  - [x] 관광 타입 뱃지 (CONTENT_TYPE_NAME 사용)
  - [x] 소분류 표시 (cat3)
  - [x] 호버 효과 (scale, shadow)
  - [x] Props 타입 정의

- [x] tour-list.tsx 컴포넌트 구현
  - [x] Client Component 설정
  - [x] 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
  - [x] TourCard 컴포넌트 map으로 렌더링
  - [x] 로딩 상태 (SkeletonCard 6개)
  - [x] 빈 상태 처리 (검색 결과 없음 메시지)
  - [x] 에러 처리 (ErrorMessage 컴포넌트)
  - [x] Props 타입 정의

- [x] tour-filters.tsx 컴포넌트 구현
  - [x] Client Component 설정
  - [x] Sticky 위치 (상단 고정)
  - [x] 지역 필터 구현
    - [x] getAreaCode() API 호출
    - [x] Select 드롭다운 사용
    - [x] "전체" 옵션
    - [x] 로딩 상태 처리
  - [x] 관광 타입 필터 구현
    - [x] Checkbox 그룹 사용
    - [x] CONTENT_TYPE 상수 활용
    - [x] "전체 선택/해제" 버튼
  - [x] 반려동물 동반 필터 구현
    - [x] Switch 토글 버튼
  - [x] 정렬 옵션 구현
    - [x] Select 드롭다운 사용
    - [x] 최신순, 이름순, 조회순 옵션
  - [x] 필터 초기화 버튼
  - [x] 필터 변경 콜백 처리
  - [x] Props 타입 정의

- [x] tour-search.tsx 컴포넌트 구현
  - [x] Client Component 설정
  - [x] Input 컴포넌트 사용
  - [x] 검색 아이콘 (Search, lucide-react)
  - [x] 엔터 키 처리
  - [x] 검색 버튼 클릭 처리
  - [x] 검색 중 로딩 스피너
  - [x] 검색 결과 개수 표시
  - [x] Props 타입 정의

- [x] naver-map.tsx 컴포넌트 구현
  - [x] Client Component 설정
  - [x] Script 컴포넌트로 스크립트 로드
  - [x] 지도 초기화 (useEffect)
  - [x] 지도 컨테이너 설정 (ref 사용)
  - [x] 초기 중심 좌표 설정 (서울 중심)
  - [x] 줌 레벨 설정 (기본값 10)
  - [x] 마커 생성 및 표시
    - [x] 좌표 변환 함수 (convertKATECToWGS84)
    - [x] 관광지 목록을 마커로 변환
    - [x] 마커 클릭 이벤트 처리
  - [x] 인포윈도우 구현
    - [x] 관광지명 표시
    - [x] 주소 표시
    - [x] "상세보기" 버튼
  - [x] 지도-리스트 연동
    - [x] selectedTour 변경 시 지도 이동
    - [x] 마커 클릭 시 onTourSelect 콜백
  - [x] 반응형 레이아웃
    - [x] 최소 높이 설정 (모바일 400px, 데스크톱 600px)
  - [x] 타입 정의 추가 (types/naver.d.ts)
  - [x] Props 타입 정의

- [x] app/page.tsx 업데이트
  - [x] Client Component 설정
  - [x] 상태 관리 (useState)
    - [x] 관광지 목록 데이터
    - [x] 로딩 상태
    - [x] 에러 상태
    - [x] 검색 키워드
    - [x] 필터 상태 (지역, 타입, 반려동물, 정렬)
    - [x] 선택된 관광지 (지도 연동)
  - [x] API 호출 로직
    - [x] loadTours 함수 (useCallback)
    - [x] 검색 모드 / 목록 조회 모드 구분
    - [x] 필터 변경 시 자동 재로드 (useEffect)
  - [x] 이벤트 핸들러
    - [x] handleFilterChange
    - [x] handleSearch
    - [x] handleRetry
    - [x] handleTourSelect
  - [x] 레이아웃 구성
    - [x] 검색 영역 (상단)
    - [x] 필터 영역 (sticky)
    - [x] 메인 콘텐츠 영역 (리스트 + 지도 분할)
  - [x] 반응형 디자인
    - [x] 데스크톱: 좌우 분할 (50% / 50%)
    - [x] 모바일: 세로 스택

## Phase 3: 상세페이지 (`/places/[contentId]`)

- [x] 페이지 기본 구조
  - [x] `app/places/[contentId]/page.tsx` 생성
    - [x] 동적 라우팅 설정 (Next.js 15 async params)
    - [x] 뒤로가기 버튼 (헤더)
    - [x] 기본 레이아웃 구조
    - [x] 404 페이지 (not-found.tsx)
- [x] 기본 정보 섹션 (MVP 2.4.1)
  - [x] `components/tour-detail/detail-info.tsx` 생성
    - [x] `getDetailCommon()` API 연동
    - [x] 관광지명 (대제목)
    - [x] 대표 이미지 (크게 표시, Next.js Image)
    - [x] 주소 표시 및 복사 기능
      - [x] 클립보드 API 사용
      - [x] 복사 완료 피드백 (Check 아이콘)
    - [x] 전화번호 (클릭 시 전화 연결)
    - [x] 홈페이지 (링크)
    - [x] 개요 (긴 설명문, HTML 렌더링)
    - [x] 관광 타입 및 카테고리 뱃지
    - [x] 정보 없는 항목 숨김 처리
- [x] 운영 정보 섹션 (MVP 2.4.2)
  - [x] `components/tour-detail/detail-intro.tsx` 생성
    - [x] `getDetailIntro()` API 연동
    - [x] 운영시간/개장시간
    - [x] 휴무일
    - [x] 이용요금 (타입별 필드명 처리)
    - [x] 주차 가능 여부
    - [x] 수용인원
    - [x] 체험 프로그램
    - [x] 유모차/반려동물 동반 가능 여부
    - [x] 정보 없는 항목 숨김 처리
- [x] 이미지 갤러리 (MVP 2.4.3)
  - [x] `components/tour-detail/detail-gallery.tsx` 생성
    - [x] `getDetailImage()` API 연동
    - [x] 대표 이미지 + 서브 이미지들
    - [x] 이미지 그리드 레이아웃 (모바일 2열, 데스크톱 3-4열)
    - [x] 이미지 클릭 시 전체화면 모달 (Dialog)
    - [x] 이미지 네비게이션 (이전/다음 버튼)
    - [x] 키보드 네비게이션 (ESC, 화살표)
    - [x] 이미지 인덱스 표시
    - [x] Next.js Image 컴포넌트 사용 (최적화)
- [x] 지도 섹션 (MVP 2.4.4)
  - [x] `components/tour-detail/detail-map.tsx` 생성
    - [x] 해당 관광지 위치 표시
    - [x] 마커 1개 표시
    - [x] 인포윈도우 표시
    - [x] "길찾기" 버튼
      - [x] 네이버 지도 앱/웹 연동
      - [x] URL: `https://map.naver.com/v5/search/{주소}`
    - [x] 좌표 변환 (KATEC → WGS84)
- [x] 공유 기능 (MVP 2.4.5)
  - [x] `components/tour-detail/share-button.tsx` 생성
    - [x] URL 복사 기능
      - [x] `navigator.clipboard.writeText()` 사용
      - [x] HTTPS 환경 확인
    - [x] 복사 완료 피드백 (Check 아이콘)
    - [x] 공유 아이콘 버튼 (Share2 아이콘)
  - [x] Open Graph 메타태그
    - [x] `app/places/[contentId]/page.tsx`에 generateMetadata 함수 생성
    - [x] `og:title` - 관광지명
    - [x] `og:description` - 관광지 설명 (100자 이내, HTML 태그 제거)
    - [x] `og:image` - 대표 이미지 (1200x630 권장)
    - [x] `og:url` - 상세페이지 URL
    - [x] `og:type` - "website"
    - [x] `twitter:card` - "summary_large_image"
- [x] 북마크 기능 (MVP 2.4.5)
  - [x] `components/bookmarks/bookmark-button.tsx` 생성
    - [x] 별 아이콘 (채워짐/비어있음)
    - [x] 북마크 상태 확인 (API Route 조회)
    - [x] 북마크 추가/제거 기능
    - [x] 인증된 사용자 확인 (Clerk useUser)
    - [x] 로그인하지 않은 경우: 로그인 페이지로 이동
    - [x] 낙관적 업데이트 (Optimistic Update)
  - [x] Supabase 연동
    - [x] `app/api/bookmarks/route.ts` 생성 (API Route)
      - [x] GET - 북마크 조회
      - [x] POST - 북마크 추가
      - [x] DELETE - 북마크 제거
    - [x] `bookmarks` 테이블 사용 (db.sql 참고)
      - [x] `user_id` (users 테이블 참조, clerk_id로 조회)
      - [x] `content_id` (한국관광공사 API contentid)
      - [x] UNIQUE 제약 (user_id, content_id)
  - [x] 상세페이지에 북마크 버튼 추가
- [x] 반려동물 정보 섹션 (MVP 2.5)
  - [x] `components/tour-detail/detail-pet-tour.tsx` 생성
    - [x] `getDetailPetTour()` API 연동
    - [x] 반려동물 동반 가능 여부 표시
    - [x] 반려동물 크기 제한 정보
    - [x] 반려동물 입장 가능 장소 (실내/실외)
    - [x] 반려동물 동반 추가 요금
    - [x] 반려동물 전용 시설 정보
    - [x] 아이콘 및 뱃지 디자인 (🐾)
    - [x] 주의사항 강조 표시
- [x] 추천 관광지 섹션 (선택 사항)
  - [x] 같은 지역 또는 타입의 다른 관광지 추천
  - [x] 카드 형태로 표시
  - [x] "더보기" 링크 (홈페이지로 이동, 필터 적용)
- [x] 최종 통합 및 스타일링
  - [x] 모든 섹션 통합
  - [x] 반응형 디자인 확인 (모바일 우선, 최대 너비 1200px)
  - [x] 모바일 최적화
  - [x] 접근성 확인 (ARIA 라벨, 키보드 네비게이션, sr-only)

---

**상세 구현 계획 (plan 모드 build)**

- [x] 페이지 기본 구조 구현
  - [x] app/places/[contentId]/page.tsx 생성
    - [x] Next.js 15 async params 처리
    - [x] Server Component로 구현
    - [x] generateMetadata 함수 구현
    - [x] 기본 레이아웃 (헤더, 메인)
    - [x] 뒤로가기 버튼
    - [x] 공유/북마크 버튼 배치
  - [x] app/places/[contentId]/not-found.tsx 생성
    - [x] 404 페이지 구현

- [x] 기본 정보 섹션 구현
  - [x] components/tour-detail/detail-info.tsx 생성
    - [x] Client Component 설정
    - [x] getDetailCommon() API 연동 (Server Component에서 호출)
    - [x] 관광지명 표시 (h1, text-3xl/4xl)
    - [x] 대표 이미지 표시 (Next.js Image, aspect-video)
    - [x] 주소 표시 및 복사 기능
      - [x] 클립보드 API 사용
      - [x] 복사 완료 피드백 (Check 아이콘, 2초 표시)
    - [x] 전화번호 표시 (tel: 링크)
    - [x] 홈페이지 링크 (외부 링크)
    - [x] 개요 표시 (HTML 렌더링, dangerouslySetInnerHTML)
    - [x] 관광 타입 및 카테고리 뱃지
    - [x] 정보 없는 항목 숨김 처리

- [x] 운영 정보 섹션 구현
  - [x] components/tour-detail/detail-intro.tsx 생성
    - [x] Client Component 설정
    - [x] getDetailIntro() API 연동 (Server Component에서 호출)
    - [x] 운영시간 표시 (Clock 아이콘)
    - [x] 휴무일 표시 (Calendar 아이콘)
    - [x] 이용요금 표시 (DollarSign 아이콘, 타입별 필드명 처리)
    - [x] 주차 가능 여부 표시 (Car 아이콘)
    - [x] 수용인원 표시 (Users 아이콘)
    - [x] 체험 프로그램 표시
    - [x] 유모차/반려동물 동반 가능 여부 표시
    - [x] 문의처 표시
    - [x] 정보 없는 항목 숨김 처리
    - [x] InfoItem 컴포넌트 구현

- [x] 이미지 갤러리 구현
  - [x] components/tour-detail/detail-gallery.tsx 생성
    - [x] Client Component 설정
    - [x] getDetailImage() API 연동 (Server Component에서 호출)
    - [x] 이미지 그리드 레이아웃 (모바일 2열, 데스크톱 3-4열)
    - [x] 대표 이미지 포함
    - [x] 이미지 클릭 시 전체화면 모달 (Dialog)
    - [x] 이미지 네비게이션 (이전/다음 버튼)
    - [x] 키보드 네비게이션 (ESC, 화살표)
    - [x] 이미지 인덱스 표시 (1 / 5 형식)
    - [x] Next.js Image 컴포넌트 사용
    - [x] 이미지 없으면 섹션 숨김

- [x] 지도 섹션 구현
  - [x] components/tour-detail/detail-map.tsx 생성
    - [x] Client Component 설정
    - [x] 네이버 지도 초기화 (Script 컴포넌트)
    - [x] 단일 마커 표시
    - [x] 좌표 변환 (convertKATECToWGS84)
    - [x] 인포윈도우 표시 (관광지명, 주소)
    - [x] 길찾기 버튼 구현
      - [x] 네이버 지도 검색 URL 사용
      - [x] 새 창에서 열기
    - [x] 초기 줌 레벨 15 설정

- [x] 공유 기능 구현
  - [x] components/tour-detail/share-button.tsx 생성
    - [x] Client Component 설정
    - [x] URL 복사 기능 (navigator.clipboard.writeText)
    - [x] 복사 완료 피드백 (Check 아이콘)
    - [x] 공유 아이콘 버튼 (Share2 아이콘)
    - [x] 에러 처리 (alert 폴백)

- [x] Open Graph 메타태그 구현
  - [x] generateMetadata 함수 구현
    - [x] getDetailCommon() 호출
    - [x] og:title 설정
    - [x] og:description 설정 (overview의 처음 100자, HTML 태그 제거)
    - [x] og:image 설정 (상대 경로 절대 경로 변환)
    - [x] og:url 설정
    - [x] og:type 설정
    - [x] twitter:card 설정

- [x] 북마크 기능 구현
  - [x] app/api/bookmarks/route.ts 생성
    - [x] GET: 북마크 조회
      - [x] Clerk 인증 확인
      - [x] Supabase users 테이블에서 clerk_id로 사용자 찾기
      - [x] 북마크 조회
    - [x] POST: 북마크 추가
      - [x] Clerk 인증 확인
      - [x] Supabase users 테이블에서 clerk_id로 사용자 찾기
      - [x] 북마크 추가 (중복 처리)
    - [x] DELETE: 북마크 제거
      - [x] Clerk 인증 확인
      - [x] Supabase users 테이블에서 clerk_id로 사용자 찾기
      - [x] 북마크 제거
  - [x] components/bookmarks/bookmark-button.tsx 생성
    - [x] Client Component 설정
    - [x] Clerk useUser 훅 사용
    - [x] 북마크 상태 조회 (useEffect)
    - [x] 북마크 토글 기능
    - [x] 로그인하지 않은 경우 로그인 페이지로 이동
    - [x] 낙관적 업데이트
    - [x] 로딩 상태 처리

- [x] 반려동물 정보 섹션 구현
  - [x] components/tour-detail/detail-pet-tour.tsx 생성
    - [x] Client Component 설정
    - [x] getDetailPetTour() API 연동 (Server Component에서 호출)
    - [x] 반려동물 동반 가능 여부 표시 (Heart 아이콘, 뱃지)
    - [x] 반려동물 크기 제한 정보 표시
    - [x] 반려동물 입장 가능 장소 표시
    - [x] 반려동물 동반 추가 요금 표시
    - [x] 주의사항 강조 표시 (AlertTriangle 아이콘, 경고 스타일)
    - [x] 주차장 정보 표시
    - [x] 정보 없으면 섹션 숨김

- [x] 페이지 통합
  - [x] app/places/[contentId]/page.tsx에 모든 컴포넌트 통합
    - [x] 병렬 API 호출 (getDetailIntro, getDetailImage, getDetailPetTour)
    - [x] 섹션 순서: 기본 정보 → 이미지 갤러리 → 운영 정보 → 반려동물 정보 → 지도
    - [x] 조건부 렌더링 (데이터가 있는 경우만 표시)
  - [x] 반응형 디자인
    - [x] 모바일: 단일 컬럼, 패딩 조정
    - [x] 데스크톱: 최대 너비 1200px (max-w-4xl)
  - [x] 접근성
    - [x] ARIA 라벨 추가 (sr-only)
    - [x] 키보드 네비게이션 지원 (이미지 갤러리)
    - [x] 시맨틱 HTML 사용

## Phase 4: 통계 대시보드 페이지 (`/stats`)

- [x] 페이지 기본 구조
  - [x] `app/stats/page.tsx` 생성
    - [x] 기본 레이아웃 구조
    - [x] 반응형 레이아웃 설정 (모바일 우선)
    - [x] Server Component로 구현
- [x] 통계 데이터 수집
  - [x] `lib/api/stats-api.ts` 생성
    - [x] `getRegionStats()` - 지역별 관광지 개수 집계
      - [x] `getAreaCode()`로 지역 코드 목록 조회
      - [x] `areaBasedList2` API로 각 지역별 totalCount 조회
      - [x] 지역 코드별로 병렬 API 호출 (Promise.allSettled)
      - [x] 데이터 변환 및 정렬 (count 내림차순)
    - [x] `getTypeStats()` - 타입별 관광지 개수 집계
      - [x] `CONTENT_TYPE` 상수 활용
      - [x] `areaBasedList2` API로 각 타입별 totalCount 조회
      - [x] contentTypeId별로 병렬 API 호출 (Promise.allSettled)
      - [x] 데이터 변환 및 정렬 (count 내림차순)
    - [x] `getStatsSummary()` - 전체 통계 요약
      - [x] `getRegionStats()`와 `getTypeStats()` 병렬 호출
      - [x] 전체 관광지 수 조회 (별도 API 호출 또는 지역 합계)
      - [x] Top 3 지역 추출
      - [x] Top 3 타입 추출
      - [x] 마지막 업데이트 시간 기록
    - [x] 병렬 API 호출로 성능 최적화 (Promise.allSettled)
    - [x] 에러 처리 및 재시도 로직 (일부 실패해도 계속 진행)
    - [x] 데이터 캐싱 (Server Component에서 fetch 캐싱 활용, revalidate: 3600)
- [x] 통계 요약 카드
  - [x] `components/stats/stats-summary.tsx` 생성
    - [x] 전체 관광지 수 표시
    - [x] Top 3 지역 표시 (카드 형태)
    - [x] Top 3 타입 표시 (카드 형태)
    - [x] 마지막 업데이트 시간 표시
    - [x] 로딩 상태 (Skeleton UI)
    - [x] 카드 레이아웃 디자인
  
  ---
  **상세 구현 계획 (plan 모드 build)**
  
  - [x] 컴포넌트 기본 구조 설정
    - [x] Client Component 설정 ('use client')
    - [x] Props 인터페이스 정의 (StatsSummaryProps)
    - [x] 필요한 import 문 추가
  
  - [x] 유틸리티 함수 구현
    - [x] formatNumber() - 숫자 천 단위 구분 표시
    - [x] formatLastUpdated() - 마지막 업데이트 시간 포맷팅 (상대/절대 시간)
    - [x] getRankVariant() - 순위 뱃지 색상 변형 선택
  
  - [x] 전체 관광지 수 카드 구현
    - [x] Card 컴포넌트로 레이아웃 구성
    - [x] BarChart3 아이콘 표시
    - [x] 숫자 포맷팅 및 표시 (text-3xl)
    - [x] 마지막 업데이트 시간 표시 (Clock 아이콘)
  
  - [x] Top 3 지역 카드 구현
    - [x] 순위 뱃지 표시 (1위, 2위, 3위)
    - [x] 지역명 및 관광지 개수 표시
    - [x] MapPin 아이콘 표시
    - [x] Link 컴포넌트로 클릭 인터랙션 (/?areaCode={areaCode})
    - [x] 호버 효과 (hover:shadow-md, hover:scale-105)
  
  - [x] Top 3 타입 카드 구현
    - [x] 순위 뱃지 표시
    - [x] 타입명 및 관광지 개수 표시
    - [x] TrendingUp 아이콘 표시
    - [x] Link 컴포넌트로 클릭 인터랙션 (/?contentTypeId={contentTypeId})
    - [x] 호버 효과
  
  - [x] 로딩 상태 구현
    - [x] Skeleton UI 추가 (4개 카드)
    - [x] 조건부 렌더링 (isLoading || !summary)
  
  - [x] 빈 상태 처리
    - [x] 데이터 없을 때 메시지 표시
    - [x] Top 3 타입이 3개 미만인 경우 빈 카드로 채우기
  
  - [x] 반응형 디자인 적용
    - [x] 그리드 레이아웃 (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)
    - [x] 카드 높이 통일 (h-full)
  
  - [x] 접근성 개선
    - [x] ARIA 라벨 추가 (aria-label)
    - [x] role="button" 설정 (클릭 가능한 카드)
    - [x] 의미 있는 텍스트 (aria-label에 상세 정보)
  
  - [x] 페이지 통합
    - [x] app/stats/page.tsx에 StatsSummary 컴포넌트 통합
    - [x] getStatsSummary() API 호출
    - [x] 에러 처리 (try-catch)
- [x] 지역별 분포 차트 (Bar Chart)
  - [x] `components/stats/region-chart.tsx` 생성
    - [x] shadcn/ui Chart 컴포넌트 설치 (Bar)
    - [x] recharts 기반 Bar Chart 구현
    - [x] X축: 지역명 (서울, 부산, 제주 등)
    - [x] Y축: 관광지 개수
    - [x] 상위 10개 지역 표시 (또는 전체)
    - [x] 바 클릭 시 해당 지역 목록 페이지로 이동
    - [x] 호버 시 정확한 개수 표시
    - [x] 다크/라이트 모드 지원
    - [x] 반응형 디자인
    - [x] 로딩 상태
    - [x] 접근성 (ARIA 라벨, 키보드 네비게이션)
  
  ---
  **상세 구현 계획 (plan 모드 build)**
  
  - [x] 필수 패키지 설치
    - [x] recharts 패키지 설치 (`pnpm add recharts`)
    - [x] shadcn/ui Chart 컴포넌트 설치 (`pnpx shadcn@latest add chart`)
  
  - [x] 컴포넌트 기본 구조 설정
    - [x] Client Component 설정 ('use client')
    - [x] Props 인터페이스 정의 (RegionChartProps)
    - [x] 필요한 import 문 추가 (recharts, Chart 컴포넌트)
  
  - [x] 차트 데이터 준비
    - [x] RegionStats[] → recharts 형식 변환 (useMemo)
    - [x] limit 파라미터로 상위 N개 제한 (기본값: 10)
    - [x] ChartData 인터페이스 정의
  
  - [x] Bar Chart 구현
    - [x] ChartContainer로 감싸기
    - [x] ResponsiveContainer로 반응형 처리
    - [x] BarChart, Bar, XAxis, YAxis 구성
    - [x] CartesianGrid 추가 (격자선)
    - [x] ChartTooltip 커스터마이징
  
  - [x] X축 설정
    - [x] dataKey="name" (지역명)
    - [x] angle={-45} (텍스트 회전)
    - [x] textAnchor="end"
    - [x] height={80} (텍스트 공간 확보)
    - [x] tick 스타일링 (muted-foreground)
  
  - [x] Y축 설정
    - [x] tickFormatter로 천 단위 구분 표시
    - [x] tick 스타일링 (muted-foreground)
  
  - [x] Bar 설정
    - [x] dataKey="count"
    - [x] fill 색상 (chart-1)
    - [x] radius={[4, 4, 0, 0]} (둥근 모서리)
    - [x] onClick 핸들러 (바 클릭 시 해당 지역 필터 적용)
    - [x] cursor: pointer 스타일
  
  - [x] Tooltip 구현
    - [x] ChartTooltipContent 커스터마이징
    - [x] 지역명 및 정확한 개수 표시
    - [x] 천 단위 구분 포맷팅
  
  - [x] 인터랙션 구현
    - [x] 바 클릭 핸들러 (useRouter로 페이지 이동)
    - [x] URL 쿼리 파라미터 추가 (/?areaCode={areaCode})
  
  - [x] 로딩 상태 구현
    - [x] Skeleton UI 추가 (h-[400px])
    - [x] 조건부 렌더링 (isLoading || !regionStats)
  
  - [x] 빈 상태 처리
    - [x] 데이터 없을 때 메시지 표시
  
  - [x] 반응형 디자인 적용
    - [x] ResponsiveContainer로 자동 반응형 처리
    - [x] 차트 높이 400px 고정
    - [x] X축 텍스트 회전 (모바일 대응)
  
  - [x] 접근성 개선
    - [x] aria-label 추가 (BarChart, 각 바)
    - [x] 의미 있는 텍스트
  
  - [x] 페이지 통합
    - [x] app/stats/page.tsx에 RegionChart 컴포넌트 통합
    - [x] getRegionStats() API 호출 추가
    - [x] Promise.all로 병렬 데이터 수집
    - [x] 에러 처리 (try-catch)
- [x] 타입별 분포 차트 (Donut Chart)
  - [x] `components/stats/type-chart.tsx` 생성
    - [x] shadcn/ui Chart 컴포넌트 설치 (Pie/Donut)
    - [x] recharts 기반 Donut Chart 구현
    - [x] 타입별 비율 (백분율)
    - [x] 타입별 개수 표시
    - [x] 섹션 클릭 시 해당 타입 목록 페이지로 이동
    - [x] 호버 시 타입명, 개수, 비율 표시
    - [x] 다크/라이트 모드 지원
    - [x] 반응형 디자인
    - [x] 로딩 상태
    - [x] 접근성 (ARIA 라벨)
  
  ---
  **상세 구현 계획 (plan 모드 build)**
  
  - [x] 컴포넌트 기본 구조 설정
    - [x] Client Component 설정 ('use client')
    - [x] Props 인터페이스 정의 (TypeChartProps)
    - [x] 필요한 import 문 추가 (recharts, Chart 컴포넌트)
  
  - [x] 차트 데이터 준비
    - [x] TypeStats[] → recharts Pie 형식 변환 (useMemo)
    - [x] 비율 계산 로직 (전체 합계 대비 백분율)
    - [x] 색상 팔레트 정의 (8개 타입, chart-1 ~ chart-8)
    - [x] ChartData 인터페이스 정의
  
  - [x] Donut Chart 구현
    - [x] ChartContainer로 감싸기
    - [x] ResponsiveContainer로 반응형 처리
    - [x] PieChart, Pie 구성
    - [x] innerRadius 설정으로 Donut 효과 (outerRadius: 120, innerRadius: 80)
    - [x] Cell로 각 섹션 색상 지정
    - [x] paddingAngle로 섹션 간 간격 설정 (2도)
  
  - [x] 인터랙션 구현
    - [x] 섹션 클릭 핸들러 (useRouter로 페이지 이동)
    - [x] URL 쿼리 파라미터 추가 (/?contentTypeId={contentTypeId})
    - [x] Tooltip 커스터마이징 (타입명, 개수, 비율 표시)
    - [x] Legend 구현 (타입명과 비율 표시)
  
  - [x] 로딩 상태 구현
    - [x] Skeleton UI 추가 (h-[400px], rounded-full)
    - [x] 조건부 렌더링 (isLoading || !typeStats)
  
  - [x] 빈 상태 처리
    - [x] 데이터 없을 때 메시지 표시
  
  - [x] 반응형 디자인 적용
    - [x] ResponsiveContainer로 자동 반응형 처리
    - [x] 차트 높이 400px 고정
  
  - [x] 접근성 개선
    - [x] aria-label 추가 (PieChart, 각 Cell)
    - [x] 의미 있는 텍스트 (타입명, 개수, 비율)
  
  - [x] 페이지 통합
    - [x] app/stats/page.tsx에 TypeChart 컴포넌트 통합
    - [x] getTypeStats() API 호출 추가
    - [x] Promise.all로 병렬 데이터 수집
    - [x] 에러 처리 (try-catch)
- [x] 페이지 통합
  - [x] `app/stats/page.tsx`에 모든 컴포넌트 통합
    - [x] 통계 요약 카드 (상단)
    - [x] 지역별 분포 차트 (중단)
    - [x] 타입별 분포 차트 (하단)
  - [x] 에러 처리 (에러 메시지 + 재시도 버튼)
  - [x] 네비게이션에 통계 페이지 링크 추가
  - [x] 최종 페이지 확인
  
  ---
  **상세 구현 계획 (plan 모드 build)**
  
  - [x] 에러 처리 구현
    - [x] Promise.allSettled로 각 API 호출별 에러 상태 분리
    - [x] errors 객체로 각 섹션별 에러 상태 관리
    - [x] ErrorMessage 컴포넌트 통합 (각 섹션별)
    - [x] 재시도 기능 구현 (페이지 새로고침)
    - [x] 일부 실패해도 나머지 데이터는 표시
  
  - [x] 네비게이션 링크 개선
    - [x] usePathname 훅으로 현재 경로 확인
    - [x] 활성 상태 표시 (variant="secondary", bg-secondary)
    - [x] navLinks 배열로 링크 관리
    - [x] Client Component로 전환 ('use client')
    - [x] cn 유틸리티로 조건부 스타일 적용
  
  - [x] 최종 페이지 확인
    - [x] 레이아웃 및 섹션 순서 확인
    - [x] 에러 처리 동작 확인
    - [x] 네비게이션 활성 상태 확인
    - [x] 반응형 디자인 확인
    - [x] 접근성 확인 (ARIA 라벨)

## Phase 5: 북마크 페이지 (`/bookmarks`) - 선택 사항

- [x] Supabase 설정 확인
  - [x] `bookmarks` 테이블 확인 (db.sql 참고)
    - [x] `users` 테이블과의 관계 확인
    - [x] 인덱스 확인 (user_id, content_id, created_at)
    - [x] RLS 비활성화 확인 (개발 환경)

  ---
  **상세 구현 계획 (plan 모드 build)**

  - [x] Supabase 설정 확인 API 생성
    - [x] `app/api/verify-supabase/route.ts` 생성
    - [x] 환경변수 확인 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    - [x] Supabase 연결 테스트
    - [x] 테이블 존재 및 구조 확인 (users, bookmarks)
    - [x] 인덱스 확인 (idx_bookmarks_user_id, idx_bookmarks_content_id, idx_bookmarks_created_at)
    - [x] RLS 상태 확인 (개발 환경에서는 비활성화)
    - [x] 권한 확인 (anon, authenticated, service_role)
    - [x] 외래키 관계 확인 (bookmarks.user_id → users.id)
    - [x] 검증 결과 JSON 응답 반환
    - [x] 권장사항 자동 생성

  - [x] 검증 기능 구현
    - [x] 환경변수 유효성 검증
    - [x] 데이터베이스 연결 테스트
    - [x] PostgreSQL 시스템 카탈로그 쿼리
    - [x] 에러 처리 및 상세 로깅
    - [x] 브라우저에서 확인 가능한 API 엔드포인트

  - [x] 테스트 및 확인
    - [x] API Route 정상 작동 확인
    - [x] GET /api/verify-supabase 요청 테스트
    - [x] 응답 형식 및 내용 확인
    - [x] 에러 케이스 테스트 (환경변수 누락 등)
- [x] 북마크 목록 페이지
  - [x] `app/bookmarks/page.tsx` 생성
    - [x] 인증된 사용자만 접근 가능
    - [x] 로그인하지 않은 경우 로그인 유도
  - [x] `components/bookmarks/bookmark-list.tsx` 생성
    - [x] 사용자 북마크 목록 조회 (`getUserBookmarks()`)
    - [x] 카드 레이아웃 (홈페이지와 동일한 tour-card 사용)
    - [x] 빈 상태 처리 (북마크 없을 때)
    - [x] 로딩 상태 (Skeleton UI)

  ---
  **상세 구현 계획 (plan 모드 build)**

  - [x] 북마크 목록 페이지 생성
    - [x] `app/bookmarks/page.tsx` Server Component 생성
    - [x] Clerk 인증 확인 (`auth()` 사용)
    - [x] 로그인하지 않은 경우 `/sign-in`으로 리다이렉트
    - [x] Supabase `users` 테이블에서 Clerk user ID로 사용자 찾기
    - [x] 북마크 목록 조회 (`getUserBookmarks()`)
    - [x] 각 content_id에 대해 `getDetailCommon()` 병렬 호출 (Promise.allSettled)
    - [x] TourDetail → TourItem 변환
    - [x] 메타데이터 설정 (SEO)
    - [x] 페이지 헤더 (제목, 북마크 개수 표시)

  - [x] 북마크 목록 컴포넌트 생성
    - [x] `components/bookmarks/bookmark-list.tsx` Client Component 생성
    - [x] TourCard 컴포넌트 재사용 (그리드 레이아웃)
    - [x] Props 인터페이스 정의 (tours, isLoading, error, onRetry)
    - [x] 로딩 상태: SkeletonCard 6개 표시
    - [x] 빈 상태: 북마크 없을 때 안내 메시지와 관광지 둘러보기 버튼
    - [x] 에러 상태: ErrorMessage 컴포넌트 사용
    - [x] 북마크 개수 표시
    - [x] 반응형 그리드 (모바일 1열, 태블릿 2열, 데스크톱 3열)
    - [x] 접근성 (ARIA 라벨, 의미 있는 텍스트)

  - [x] 데이터 처리 로직 구현
    - [x] 북마크 content_id 목록 조회
    - [x] 한국관광공사 API로 관광지 상세 정보 병렬 조회
    - [x] 실패한 조회는 필터링 (일부 실패해도 성공 항목 표시)
    - [x] 에러 처리 및 로깅
    - [x] 데이터 변환 (Bookmark[] → TourItem[])

  - [x] UI/UX 구현
    - [x] Bookmark 아이콘 사용
    - [x] 북마크 개수 실시간 표시
    - [x] 빈 상태 디자인 (아이콘, 메시지, 버튼)
    - [x] 에러 복구 (재시도 버튼)
    - [x] 반응형 디자인
    - [x] 접근성 고려

  - [x] 성능 최적화
    - [x] Server Component로 초기 데이터 페칭
    - [x] Promise.allSettled로 병렬 API 호출
    - [x] Next.js Image 컴포넌트 사용 (TourCard에서)
    - [x] 불필요한 재렌더링 방지

  - [x] 테스트 및 검증
    - [x] 인증되지 않은 사용자 접근 시 리다이렉트 확인
    - [x] 북마크 없는 사용자 빈 상태 확인
    - [x] 북마크 있는 사용자 목록 표시 확인
    - [x] API 에러 시 에러 메시지 표시 확인
    - [x] 반응형 디자인 확인
- [x] 북마크 관리 기능
  - [x] 정렬 옵션
    - [x] 최신순 (created_at DESC)
    - [x] 이름순 (가나다순)
    - [x] 지역별
  - [x] 일괄 삭제 기능
    - [x] 체크박스 선택
    - [x] 선택 항목 삭제
    - [x] 확인 다이얼로그
  - [x] 개별 삭제 기능
    - [x] 각 카드에 삭제 버튼
  - [x] 페이지 통합 및 스타일링
    - [x] 반응형 디자인 확인
    - [x] 최종 페이지 확인

  ---
  **상세 구현 계획 (plan 모드 build)**

  - [x] 정렬 옵션 구현
    - [x] `BookmarkListProps`에 `bookmarks?: Bookmark[]` 추가 (정렬을 위한 메타데이터)
    - [x] `SortOption` 타입 정의 (`latest` | `name` | `region`)
    - [x] `SORT_OPTIONS` 상수 정의
    - [x] `useState<SortOption>`로 정렬 상태 관리
    - [x] `useMemo`로 정렬된 목록 계산
      - [x] 최신순: 북마크 `created_at` 기준 내림차순
      - [x] 이름순: 관광지 `title` 기준 가나다순 (`localeCompare`)
      - [x] 지역별: `areacode` 기준 정렬
    - [x] Select 컴포넌트로 정렬 옵션 UI 구현
    - [x] 헤더 영역에 정렬 옵션 배치

  - [x] 일괄 삭제 기능 구현
    - [x] `useState<string[]>`로 선택된 항목 상태 관리 (`selectedItems`)
    - [x] 전체 선택/해제 체크박스 구현
    - [x] 개별 항목 체크박스 구현 (카드 왼쪽 상단)
    - [x] 선택된 항목 개수 표시
    - [x] 일괄 삭제 버튼 (선택된 항목 있을 때만 표시)
    - [x] Dialog 컴포넌트로 확인 다이얼로그 구현
    - [x] `handleBulkDelete` 함수 구현
      - [x] 선택된 항목들을 병렬로 삭제 (`Promise.allSettled`)
      - [x] 성공/실패 처리
      - [x] 삭제 후 페이지 새로고침

  - [x] 개별 삭제 기능 구현
    - [x] 각 카드에 삭제 버튼 추가 (오른쪽 상단, 호버 시 표시)
    - [x] `Trash2` 아이콘 사용
    - [x] Dialog 컴포넌트로 개별 삭제 확인 다이얼로그
    - [x] `handleDeleteItem` 함수 구현
      - [x] 단일 항목 삭제 API 호출
      - [x] 낙관적 업데이트 (선택 항목에서 제거)
      - [x] 삭제 후 페이지 새로고침

  - [x] UI/UX 개선
    - [x] 선택된 카드에 시각적 강조 (`ring-2 ring-primary`)
    - [x] 삭제 중 로딩 상태 표시
    - [x] 반응형 디자인 (모바일/데스크톱)
    - [x] 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
    - [x] 헤더 레이아웃 개선 (북마크 개수 + 전체 선택 + 정렬 + 삭제 버튼)

  - [x] 데이터 관리
    - [x] `app/bookmarks/page.tsx`에서 `tours`와 `bookmarks` 분리
    - [x] `BookmarkList`에 두 데이터 모두 전달
    - [x] 북마크 메타데이터를 활용한 정렬
    - [x] 삭제 후 상태 동기화

  - [x] 페이지 통합
    - [x] 모든 기능 `BookmarkList` 컴포넌트에 통합
    - [x] 반응형 디자인 적용
    - [x] 에러 처리 개선
    - [x] 로딩 상태 처리

  - [x] API 연동 검증
    - [x] 기존 북마크 삭제 API 재사용 (`DELETE /api/bookmarks`)
    - [x] 병렬 삭제 처리
    - [x] 에러 처리 및 사용자 피드백

## Phase 6: 최적화 & 배포

- [x] 이미지 최적화
  - [x] `next.config.ts` 외부 도메인 설정
    - [x] 한국관광공사 이미지 도메인 추가
    - [x] 네이버 지도 이미지 도메인 추가
  - [x] Next.js Image 컴포넌트 사용 확인
    - [x] priority 속성 (above-the-fold)
    - [x] lazy loading (below-the-fold)
    - [x] responsive sizes 설정

  ---
  **상세 구현 계획 (plan 모드 build)**

  - [x] next.config.ts 외부 도메인 설정
    - [x] 한국관광공사 이미지 도메인 추가 (`api.visitkorea.or.kr`, `tong.visitkorea.or.kr`, `phoko.visitkorea.or.kr`, `korean.visitkorea.or.kr`, `www.visitkorea.or.kr`)
    - [x] 네이버 지도 이미지 도메인 추가 (`map.pstatic.net`, `ssl.pstatic.net`, `naver.net`)
    - [x] remotePatterns 설정으로 외부 이미지 도메인 허용

  - [x] priority 속성 최적화 (above-the-fold)
    - [x] TourCard 컴포넌트에 priority prop 추가
    - [x] 홈페이지 상위 6개 TourCard에 priority={true} 적용
    - [x] 북마크 페이지 상위 6개 TourCard에 priority={true} 적용
    - [x] 상세페이지 대표 이미지에 이미 priority 적용됨 (detail-info.tsx)
    - [x] 모달 이미지에 priority 적용 (detail-gallery.tsx)

  - [x] lazy loading 설정 (below-the-fold)
    - [x] Next.js Image 기본 lazy loading 동작 확인
    - [x] priority={false}인 이미지들은 자동으로 lazy loading 적용
    - [x] viewport 밖 이미지는 스크롤 시 로딩

  - [x] responsive sizes 설정 검증
    - [x] tour-card.tsx: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` ✅
    - [x] detail-info.tsx: `(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px` ✅
    - [x] detail-gallery.tsx: `(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw` ✅
    - [x] 각 컴포넌트의 실제 레이아웃과 sizes 값 일치 확인

  - [x] 빌드 및 성능 검증
    - [x] Next.js 빌드 성공 확인
    - [x] 이미지 최적화 경고 없음
    - [x] 외부 도메인 검증 에러 없음
    - [x] First Load JS 크기 확인 (166 kB ~ 229 kB)

  - [x] 추가 최적화 고려사항
    - [x] WebP 자동 변환 지원
    - [x] 이미지 품질 자동 조정 (75% 기본값)
    - [x] blurDataURL placeholder 고려 (향후 구현 가능)
    - [x] 이미지 로드 에러 처리 (fallback 이미지)
- [ ] 전역 에러 핸들링
  - [ ] `app/error.tsx` 생성
  - [ ] `app/global-error.tsx` 생성
  - [ ] API 에러 처리 개선
- [ ] 404 페이지
  - [ ] `app/not-found.tsx` 생성
    - [ ] 사용자 친화적인 메시지
    - [ ] 홈으로 돌아가기 버튼
- [ ] SEO 최적화
  - [ ] 메타태그 설정 (`app/layout.tsx`)
    - [ ] 기본 title, description
    - [ ] Open Graph 태그
    - [ ] Twitter Card 태그
  - [ ] `app/sitemap.ts` 생성
    - [ ] 동적 sitemap 생성 (관광지 상세페이지 포함)
  - [ ] `app/robots.ts` 생성
- [ ] 성능 최적화
  - [ ] Lighthouse 점수 측정 (목표: > 80)
  - [ ] 코드 분할 확인
  - [ ] 불필요한 번들 제거
  - [ ] API 응답 캐싱 전략 확인
- [ ] 환경변수 보안 검증
  - [ ] 모든 필수 환경변수 확인
  - [ ] `.env.example` 업데이트
  - [ ] 프로덕션 환경변수 설정 가이드 작성
- [ ] 배포 준비
  - [ ] Vercel 배포 설정
  - [ ] 환경변수 설정 (Vercel 대시보드)
  - [ ] 빌드 테스트 (`pnpm build`)
  - [ ] 프로덕션 배포 및 테스트

## 추가 작업 (선택 사항)

- [ ] 다크 모드 지원
  - [ ] 테마 전환 기능
  - [ ] 모든 컴포넌트 다크 모드 스타일 적용
- [ ] PWA 지원
  - [ ] `app/manifest.ts` 생성
  - [ ] Service Worker 설정
  - [ ] 오프라인 지원
- [ ] 접근성 개선
  - [ ] ARIA 라벨 추가
  - [ ] 키보드 네비게이션 개선
  - [ ] 색상 대비 확인 (WCAG AA)
- [ ] 성능 모니터링
  - [ ] Web Vitals 측정
  - [ ] 에러 로깅 (Sentry 등)
- [ ] 사용자 피드백
  - [ ] 피드백 수집 기능
  - [ ] 버그 리포트 기능
