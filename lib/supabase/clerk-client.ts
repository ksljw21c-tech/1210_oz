"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월부터 권장되는 네이티브 통합 방식:
 * - JWT 템플릿 불필요 (deprecated)
 * - Clerk를 Supabase의 third-party auth provider로 설정 필요
 * - useAuth().getToken()으로 현재 세션 토큰을 자동으로 전달
 * - Supabase가 Clerk 세션 토큰을 자동 검증
 * - RLS 정책이 auth.jwt()->>'sub'로 Clerk user ID 확인
 *
 * 설정 방법:
 * 1. Clerk Dashboard → Integrations → Supabase → Activate
 * 2. Supabase Dashboard → Authentication → Providers → Add Clerk
 * 3. Clerk domain을 Supabase에 입력
 *
 * @see {@link /docs/CLERK_SUPABASE_INTEGRATION.md} - 상세 통합 가이드
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useUser } from '@clerk/nextjs';
 *
 * export default function MyComponent() {
 *   const { user } = useUser();
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     if (!user) return;
 *
 *     // RLS 정책에 따라 현재 사용자의 데이터만 조회
 *     const { data, error } = await supabase
 *       .from('tasks')
 *       .select('*');
 *
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase URL and Anon Key must be set in environment variables"
      );
    }

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        // Clerk 세션 토큰을 Supabase 요청에 자동으로 포함
        // Supabase가 이 토큰을 검증하여 사용자 인증 상태 확인
        return (await getToken()) ?? null;
      },
    });
  }, [getToken]);

  return supabase;
}
