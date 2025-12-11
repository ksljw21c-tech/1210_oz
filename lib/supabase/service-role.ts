import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Service Role 클라이언트
 *
 * RLS(Row Level Security)를 우회하여 모든 데이터에 접근할 수 있는 관리자 클라이언트
 * 주의: 서버 사이드에서만 사용해야 하며, 클라이언트에 노출되면 안됩니다.
 *
 * 사용 사례:
 * - 사용자 동기화 (Clerk → Supabase)
 * - 관리자 작업
 * - 배치 작업
 *
 * ⚠️ 보안 주의사항:
 * - 절대 클라이언트 컴포넌트에서 사용하지 마세요
 * - API Route나 Server Action에서만 사용하세요
 * - SUPABASE_SERVICE_ROLE_KEY는 절대 클라이언트에 노출되면 안 됩니다
 *
 * @see {@link /docs/CLERK_SUPABASE_INTEGRATION.md} - 통합 가이드 참고
 *
 * @example
 * ```ts
 * // API Route에서 사용
 * import { getServiceRoleClient } from '@/lib/supabase/service-role';
 *
 * export async function POST(req: Request) {
 *   const supabase = getServiceRoleClient();
 *   const { data, error } = await supabase
 *     .from('users')
 *     .insert({ ... });
 * }
 * ```
 */
export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase URL or Service Role Key is missing. Please check your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
