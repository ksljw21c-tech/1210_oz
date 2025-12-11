# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 네이티브 통합 방식으로 연결하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [설정 단계](#설정-단계)
3. [코드 구조](#코드-구조)
4. [사용 방법](#사용-방법)
5. [RLS 정책 설정](#rls-정책-설정)
6. [문제 해결](#문제-해결)

## 개요

### 네이티브 통합 방식 (2025년 4월 이후 권장)

Clerk와 Supabase의 네이티브 통합은 다음과 같은 장점이 있습니다:

- ✅ **JWT 템플릿 불필요**: Clerk 대시보드에서 JWT 템플릿을 설정할 필요가 없습니다
- ✅ **자동 토큰 검증**: Supabase가 Clerk 세션 토큰을 자동으로 검증합니다
- ✅ **간단한 설정**: `accessToken` 함수만 제공하면 됩니다
- ✅ **보안 강화**: Supabase JWT Secret을 Clerk와 공유할 필요가 없습니다

### 이전 방식 (Deprecated)

2025년 4월 1일부터 Clerk Supabase JWT 템플릿은 deprecated되었습니다. 네이티브 통합 방식을 사용하세요.

## 설정 단계

### 1. Clerk를 Supabase Third-Party Auth Provider로 설정

#### 1-1. Clerk 대시보드에서 설정

1. [Clerk Dashboard](https://dashboard.clerk.com)에 로그인
2. **Integrations** → **Supabase**로 이동
3. **Activate Supabase integration** 클릭
4. 나타나는 **Clerk domain**을 복사 (예: `your-app.clerk.accounts.dev`)

#### 1-2. Supabase 대시보드에서 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Authentication** → **Providers** → **Third-party Auth**로 이동
4. **Add provider** 클릭
5. **Clerk** 선택
6. 복사한 **Clerk domain**을 붙여넣기
7. **Save** 클릭

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 사이드 전용
```

### 3. 패키지 설치 확인

필요한 패키지가 설치되어 있는지 확인하세요:

```bash
pnpm list @clerk/nextjs @supabase/supabase-js
```

## 코드 구조

프로젝트의 Supabase 클라이언트는 용도에 따라 분리되어 있습니다:

```
lib/supabase/
├── clerk-client.ts    # Client Component용 (React Hook)
├── server.ts          # Server Component/Server Action용
├── service-role.ts    # 관리자 권한 작업용 (RLS 우회)
└── client.ts          # 인증 불필요한 공개 데이터용
```

### 각 클라이언트의 용도

| 파일 | 용도 | 사용 위치 | RLS 적용 |
|------|------|-----------|----------|
| `clerk-client.ts` | 인증된 사용자 데이터 접근 | Client Component | ✅ |
| `server.ts` | 인증된 사용자 데이터 접근 | Server Component, Server Action | ✅ |
| `service-role.ts` | 관리자 작업 (사용자 동기화 등) | API Route, Server Action | ❌ |
| `client.ts` | 공개 데이터 접근 | Client/Server 모두 | ✅ (anon 정책) |

## 사용 방법

### Client Component에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    if (!user) return;

    // RLS 정책에 따라 현재 사용자의 데이터만 조회됩니다
    const { data, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Tasks:', data);
  }

  return (
    <div>
      <button onClick={fetchData}>데이터 가져오기</button>
    </div>
  );
}
```

### Server Component에서 사용

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // 데이터 조회 (RLS 정책 적용)
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    throw new Error('Failed to fetch tasks');
  }

  return (
    <div>
      <h1>Tasks</h1>
      <ul>
        {data?.map((task) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Server Action에서 사용

```tsx
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function createTask(name: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  if (error) {
    throw new Error('Failed to create task');
  }

  return data;
}
```

### 관리자 작업 (Service Role)

```tsx
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return;

  // Clerk에서 사용자 정보 가져오기
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  // Service Role 클라이언트로 RLS 우회하여 사용자 동기화
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from('users')
    .upsert({
      clerk_id: clerkUser.id,
      name: clerkUser.fullName || 'Unknown',
    }, {
      onConflict: 'clerk_id',
    });

  return { data, error };
}
```

## RLS 정책 설정

### 개발 환경

개발 단계에서는 RLS를 비활성화하는 것을 권장합니다:

```sql
-- 테이블 생성 시 RLS 비활성화
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 비활성화 (개발 환경)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

### 프로덕션 환경

프로덕션 배포 전에는 반드시 RLS를 활성화하고 적절한 정책을 설정하세요:

```sql
-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 작업만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자가 자신의 작업만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자가 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자가 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

### RLS 정책에서 Clerk User ID 사용

Clerk의 세션 토큰에서 사용자 ID를 가져오려면 `auth.jwt()->>'sub'`를 사용합니다:

```sql
-- 예시: user_id 컬럼이 Clerk user ID를 저장하는 경우
USING (
  (SELECT auth.jwt()->>'sub') = user_id::text
)
```

## 문제 해결

### 1. "Invalid JWT" 오류

**원인**: Clerk를 Supabase의 third-party auth provider로 설정하지 않았을 수 있습니다.

**해결**:
1. Clerk 대시보드에서 Supabase 통합이 활성화되어 있는지 확인
2. Supabase 대시보드에서 Clerk provider가 추가되어 있는지 확인
3. Clerk domain이 올바르게 설정되었는지 확인

### 2. RLS 정책으로 인한 접근 거부

**원인**: RLS 정책이 제대로 설정되지 않았거나, `user_id`가 Clerk user ID와 일치하지 않을 수 있습니다.

**해결**:
1. 개발 환경에서는 RLS를 비활성화하여 테스트
2. `auth.jwt()->>'sub'`가 올바른 Clerk user ID를 반환하는지 확인
3. 테이블의 `user_id` 컬럼이 `TEXT` 타입인지 확인 (Clerk ID는 문자열)

### 3. "Unauthorized" 오류

**원인**: 사용자가 로그인하지 않았거나, 세션 토큰이 만료되었을 수 있습니다.

**해결**:
1. `useUser()` 또는 `auth()`로 사용자 인증 상태 확인
2. Clerk 세션이 유효한지 확인
3. `getToken()`이 `null`을 반환하지 않는지 확인

### 4. Service Role 클라이언트 사용 시 주의사항

**주의**: Service Role 키는 절대 클라이언트에 노출되면 안 됩니다. 서버 사이드에서만 사용하세요.

```tsx
// ❌ 잘못된 사용 (클라이언트에 노출)
'use client';
import { getServiceRoleClient } from '@/lib/supabase/service-role'; // 절대 안 됨!

// ✅ 올바른 사용 (서버 사이드만)
import { getServiceRoleClient } from '@/lib/supabase/service-role';
```

## 참고 자료

- [Clerk 공식 문서: Supabase 통합](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase 공식 문서: Third-party Auth](https://supabase.com/docs/guides/auth/third-party/overview)
- [프로젝트 AGENTS.md](../AGENTS.md) - 프로젝트 구조 및 컨벤션

## 추가 정보

### 사용자 동기화

이 프로젝트는 `SyncUserProvider`를 통해 Clerk 사용자를 자동으로 Supabase `users` 테이블에 동기화합니다.

- 자동 동기화: 로그인 시 자동 실행
- 수동 동기화: `/api/sync-user` 엔드포인트 호출

자세한 내용은 `components/providers/sync-user-provider.tsx`를 참고하세요.


