import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 공개 데이터 클라이언트 (인증 불필요)
 *
 * Supabase 공식 가이드에 따른 구현:
 * - 공개적으로 접근 가능한 데이터 조회용
 * - RLS 정책이 `to anon`인 데이터에 접근
 * - 인증이 필요하지 않은 데이터 조회에 사용
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs} - Supabase 공식 가이드
 *
 * @example
 * ```tsx
 * // Client Component 또는 Server Component
 * import { createClient } from '@/lib/supabase/client';
 *
 * // 공개 데이터 조회
 * const supabase = createClient();
 * const { data } = await supabase
 *   .from('public_posts')
 *   .select('*');
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

/**
 * @deprecated 단일 인스턴스 대신 `createClient()` 함수를 사용하세요.
 * 공개 데이터용 Supabase 클라이언트 (레거시)
 */
export const supabase = createClient();
