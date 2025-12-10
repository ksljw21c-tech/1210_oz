# Supabase + Next.js 통합 가이드

이 문서는 Supabase 공식 가이드에 따른 Next.js 프로젝트 통합 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [환경 변수 설정](#환경-변수-설정)
3. [Server Component에서 사용](#server-component에서-사용)
4. [Client Component에서 사용](#client-component에서-사용)
5. [공개 데이터 접근](#공개-데이터-접근)
6. [Clerk 통합](#clerk-통합)

## 개요

이 프로젝트는 Supabase 공식 가이드([공식 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs))에 따라 구현되었습니다.

### 주요 특징

- ✅ Supabase 공식 가이드 패턴 준수
- ✅ Server Component에서 `await createClient()` 패턴 사용
- ✅ Clerk와 네이티브 통합 (third-party auth provider)
- ✅ 타입 안전성 보장

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 사이드 전용
```

환경 변수는 Supabase Dashboard → Settings → API에서 확인할 수 있습니다.

## Server Component에서 사용

Supabase 공식 가이드에 따라 Server Component에서 `await createClient()` 패턴을 사용합니다.

### 기본 사용법

```tsx
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function DataComponent() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('instruments')
    .select('*');

  if (error) {
    throw new Error('Failed to fetch data');
  }

  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  );
}
```

### 인증이 필요한 경우

```tsx
import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

async function ProtectedDataComponent() {
  // Clerk 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Supabase 클라이언트 생성 (Clerk 토큰 자동 포함)
  const supabase = await createClient();

  // RLS 정책에 따라 현재 사용자의 데이터만 조회
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  return (
    <div>
      {data?.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Action에서 사용

```tsx
'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function createTask(name: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      name,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create task');
  }

  return data;
}
```

## Client Component에서 사용

Client Component에서는 Clerk 통합 클라이언트를 사용합니다.

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function ClientDataComponent() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Error:', error);
        return;
      }

      setData(data || []);
    }

    fetchData();
  }, [user, supabase]);

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## 공개 데이터 접근

인증이 필요하지 않은 공개 데이터는 `lib/supabase/client.ts`를 사용합니다.

```tsx
import { createClient } from '@/lib/supabase/client';

async function PublicDataComponent() {
  const supabase = createClient();
  
  // RLS 정책이 'to anon'인 데이터 조회
  const { data, error } = await supabase
    .from('public_posts')
    .select('*');

  return (
    <div>
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## Clerk 통합

이 프로젝트는 Clerk를 Supabase의 third-party auth provider로 사용합니다.

### 설정 방법

1. **Clerk Dashboard에서 설정**
   - Integrations → Supabase → Activate
   - Clerk domain 복사

2. **Supabase Dashboard에서 설정**
   - Authentication → Providers → Third-party Auth
   - Add provider → Clerk 선택
   - Clerk domain 입력

자세한 내용은 [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)를 참고하세요.

### RLS 정책에서 Clerk User ID 사용

```sql
-- 예시: tasks 테이블
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID 저장
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

## 참고 자료

- [Supabase 공식 Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)
- [프로젝트 README](../README.md)

