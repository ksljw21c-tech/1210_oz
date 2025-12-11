import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  createApiErrorResponse,
  createAuthErrorResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createServerErrorResponse,
  createApiSuccessResponse,
  handleApiError,
} from "@/lib/api/api-utils";

/**
 * @file route.ts
 * @description 북마크 API Route
 *
 * 북마크 조회, 추가, 제거를 처리하는 API Route입니다.
 * Clerk 인증을 사용하며, Supabase users 테이블의 clerk_id를 통해 사용자를 식별합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: auth()
 * - lib/supabase/server: createClient()
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 */

/**
 * GET: 북마크 조회
 */
export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return createAuthErrorResponse();
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return createValidationErrorResponse("contentId가 필요합니다.", "contentId");
    }

    const supabase = await createClient();

    // Supabase users 테이블에서 clerk_id로 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      return createNotFoundErrorResponse("사용자");
    }

    // 북마크 조회
    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .single();

    if (bookmarkError) {
      // 데이터가 없으면 null 반환 (에러가 아님)
      if (bookmarkError.code === "PGRST116") {
        return createApiSuccessResponse({ bookmark: null });
      }
      throw bookmarkError;
    }

    return createApiSuccessResponse({ bookmark });
  } catch (error) {
    return handleApiError(error, "북마크 조회");
  }
}

/**
 * POST: 북마크 추가
 */
export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return createAuthErrorResponse();
    }

    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return createValidationErrorResponse("contentId가 필요합니다.", "contentId");
    }

    const supabase = await createClient();

    // Supabase users 테이블에서 clerk_id로 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      return createNotFoundErrorResponse("사용자");
    }

    // 북마크 추가
    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        content_id: contentId,
      })
      .select()
      .single();

    if (bookmarkError) {
      // 중복 북마크인 경우 기존 북마크 반환
      if (bookmarkError.code === "23505") {
        const { data: existing } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .eq("content_id", contentId)
          .single();

        return createApiSuccessResponse({ bookmark: existing }, "이미 북마크된 항목입니다.");
      }
      throw bookmarkError;
    }

    return createApiSuccessResponse({ bookmark }, "북마크가 추가되었습니다.");
  } catch (error) {
    return handleApiError(error, "북마크 추가");
  }
}

/**
 * DELETE: 북마크 제거
 */
export async function DELETE(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return createAuthErrorResponse();
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return createValidationErrorResponse("contentId가 필요합니다.", "contentId");
    }

    const supabase = await createClient();

    // Supabase users 테이블에서 clerk_id로 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      return createNotFoundErrorResponse("사용자");
    }

    // 북마크 제거
    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("content_id", contentId);

    if (deleteError) {
      throw deleteError;
    }

    return createApiSuccessResponse({ success: true }, "북마크가 제거되었습니다.");
  } catch (error) {
    return handleApiError(error, "북마크 제거");
  }
}

