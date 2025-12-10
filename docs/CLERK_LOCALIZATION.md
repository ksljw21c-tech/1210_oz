# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [기본 설정](#기본-설정)
3. [커스텀 로컬라이제이션](#커스텀-로컬라이제이션)
4. [에러 메시지 커스터마이징](#에러-메시지-커스터마이징)
5. [참고 자료](#참고-자료)

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 한국어는 `koKR` 키로 제공됩니다.

### 지원되는 언어

Clerk는 다음 언어를 지원합니다:
- 한국어 (ko-KR) - `koKR`
- 영어 (en-US) - `enUS` (기본값)
- 일본어 (ja-JP) - `jaJP`
- 중국어 간체 (zh-CN) - `zhCN`
- 중국어 번체 (zh-TW) - `zhTW`
- 기타 50개 이상의 언어

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 기본 설정

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있는지 확인하세요:

```bash
pnpm list @clerk/localizations
```

설치되어 있지 않다면:

```bash
pnpm add @clerk/localizations
```

### 2. RootLayout에 적용

`app/layout.tsx`에서 한국어 로컬라이제이션을 적용합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. HTML lang 속성 설정

`<html>` 태그에 `lang="ko"`를 설정하여 한국어 페이지임을 명시합니다:

```tsx
<html lang="ko">
```

## 커스텀 로컬라이제이션

기본 한국어 번역을 수정하거나 추가할 수 있습니다.

### 기본 텍스트 커스터마이징

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

const customLocalization = {
  ...koKR,
  // 버튼 텍스트 변경
  formButtonPrimary: "시작하기",
  formButtonSecondary: "취소",
  
  // SignUp 컴포넌트 텍스트 변경
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp?.start,
      subtitle: "{{applicationName}}에 가입하세요",
    },
  },
  
  // SignIn 컴포넌트 텍스트 변경
  signIn: {
    ...koKR.signIn,
    start: {
      ...koKR.signIn?.start,
      subtitle: "{{applicationName}}에 로그인하세요",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={customLocalization}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 에러 메시지 커스터마이징

에러 메시지를 한국어로 개선할 수 있습니다.

### 주요 에러 메시지

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

const koreanLocalization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 접근이 허용되지 않은 이메일 도메인
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의하세요.",
    
    // 잘못된 자격 증명
    form_identifier_not_found: "이메일 주소를 찾을 수 없습니다.",
    form_password_incorrect: "비밀번호가 올바르지 않습니다.",
    
    // 입력 형식 오류
    form_param_format_invalid: "입력 형식이 올바르지 않습니다.",
    form_param_nil: "필수 입력 항목이 누락되었습니다.",
    
    // 기타 에러
    form_code_incorrect: "인증 코드가 올바르지 않습니다.",
    form_username_exists: "이미 사용 중인 사용자 이름입니다.",
    form_email_address_exists: "이미 사용 중인 이메일 주소입니다.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={koreanLocalization}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 사용 가능한 에러 키

전체 에러 키 목록은 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체를 참고하세요.

주요 에러 키:
- `not_allowed_access`: 접근이 허용되지 않음
- `form_identifier_not_found`: 사용자를 찾을 수 없음
- `form_password_incorrect`: 비밀번호가 올바르지 않음
- `form_param_format_invalid`: 입력 형식이 올바르지 않음
- `form_param_nil`: 필수 입력 항목 누락
- `form_code_incorrect`: 인증 코드가 올바르지 않음
- `form_username_exists`: 사용자 이름이 이미 존재
- `form_email_address_exists`: 이메일 주소가 이미 존재

## 현재 프로젝트 설정

이 프로젝트는 `app/layout.tsx`에서 다음과 같이 설정되어 있습니다:

```tsx
import { koKR } from "@clerk/localizations";

const koreanLocalization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의하세요.",
    form_identifier_not_found: "이메일 주소를 찾을 수 없습니다.",
    form_password_incorrect: "비밀번호가 올바르지 않습니다.",
    form_param_format_invalid: "입력 형식이 올바르지 않습니다.",
    form_param_nil: "필수 입력 항목이 누락되었습니다.",
  },
};

<ClerkProvider localization={koreanLocalization}>
  <html lang="ko">
    {/* ... */}
  </html>
</ClerkProvider>
```

## 주의사항

### 실험적 기능

> ⚠️ **주의**: 로컬라이제이션 기능은 현재 실험적(experimental)입니다. 예상치 못한 동작이 발생할 수 있으므로 주의가 필요합니다.

### 제한사항

- 로컬라이제이션은 **Clerk 컴포넌트**의 텍스트만 변경합니다
- **Clerk Account Portal** (호스팅된 계정 관리 페이지)는 여전히 영어로 표시됩니다
- 일부 텍스트는 아직 번역되지 않았을 수 있습니다

## 테스트

로컬라이제이션이 제대로 적용되었는지 확인하려면:

1. 개발 서버 실행: `pnpm dev`
2. 로그인/회원가입 페이지 확인
3. 에러 메시지가 한국어로 표시되는지 확인

## 참고 자료

- [Clerk 공식 로컬라이제이션 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [영어 로컬라이제이션 파일 (참고용)](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)
- [한국어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/ko-KR.ts)
- [프로젝트 README](../README.md)

## 추가 커스터마이징

더 많은 커스터마이징이 필요하다면:

1. [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)을 참고하여 필요한 키 확인
2. `koKR` 객체를 확장하여 원하는 텍스트 변경
3. `app/layout.tsx`에서 커스텀 로컬라이제이션 적용

예시:

```tsx
const customLocalization = {
  ...koKR,
  // 원하는 키를 추가로 커스터마이징
  formFieldLabel__emailAddress: "이메일",
  formFieldLabel__password: "비밀번호",
  formFieldLabel__username: "사용자 이름",
};
```

