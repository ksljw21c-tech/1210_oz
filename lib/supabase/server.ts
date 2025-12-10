import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * Supabase 공식 가이드에 따른 구현:
 * - Next.js Server Component에서 사용
 * - async 함수로 구현하여 `await createClient()` 패턴 지원
 * - Clerk를 Supabase의 third-party auth provider로 설정 필요
 * - auth().getToken()으로 현재 세션 토큰을 자동으로 전달
 * - Supabase가 Clerk 세션 토큰을 자동 검증
 * - RLS 정책이 auth.jwt()->>'sub'로 Clerk user ID 확인
 *
 * 설정 방법:
 * 1. Clerk Dashboard → Integrations → Supabase → Activate
 * 2. Supabase Dashboard → Authentication → Providers → Add Clerk
 * 3. Clerk domain을 Supabase에 입력
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs} - Supabase 공식 가이드
 * @see {@link /docs/CLERK_SUPABASE_INTEGRATION.md} - 상세 통합 가이드
 *
 * @example
 * ```tsx
 * // Server Component (Supabase 공식 가이드 패턴)
 * import { createClient } from '@/lib/supabase/server';
 * import { auth } from '@clerk/nextjs/server';
 * import { redirect } from 'next/navigation';
 * import { Suspense } from 'react';
 *
 * async function DataComponent() {
 *   const { userId } = await auth();
 *   if (!userId) redirect('/sign-in');
 *
 *   const supabase = await createClient();
 *
 *   // RLS 정책에 따라 현재 사용자의 데이터만 조회
 *   const { data, error } = await supabase
 *     .from('tasks')
 *     .select('*');
 *
 *   return <div>{JSON.stringify(data, null, 2)}</div>;
 * }
 *
 * export default function MyPage() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <DataComponent />
 *     </Suspense>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Server Action
 * 'use server';
 *
 * import { createClient } from '@/lib/supabase/server';
 * import { auth } from '@clerk/nextjs/server';
 *
 * export async function createTask(name: string) {
 *   const { userId } = await auth();
 *   if (!userId) throw new Error('Unauthorized');
 *
 *   const supabase = await createClient();
 *
 *   const { data, error } = await supabase
 *     .from('tasks')
 *     .insert({ name });
 *
 *   return data;
 * }
 * ```
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      // Clerk 세션 토큰을 Supabase 요청에 자동으로 포함
      // Supabase가 이 토큰을 검증하여 사용자 인증 상태 확인
      return (await auth()).getToken();
    },
  });
}

/**
 * @deprecated 이 함수는 하위 호환성을 위해 유지됩니다. `createClient()`를 사용하세요.
 * Clerk + Supabase 네이티브 통합 클라이언트 (동기 버전)
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}
