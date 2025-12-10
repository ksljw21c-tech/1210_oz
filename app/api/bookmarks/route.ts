import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { error: "contentId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase users 테이블에서 clerk_id로 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
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
        return NextResponse.json({ bookmark: null });
      }
      throw bookmarkError;
    }

    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error("북마크 조회 실패:", error);
    return NextResponse.json(
      { error: "북마크 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * POST: 북마크 추가
 */
export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: "contentId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase users 테이블에서 clerk_id로 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
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

        return NextResponse.json({ bookmark: existing });
      }
      throw bookmarkError;
    }

    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error("북마크 추가 실패:", error);
    return NextResponse.json(
      { error: "북마크 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 북마크 제거
 */
export async function DELETE(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { error: "contentId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase users 테이블에서 clerk_id로 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("북마크 제거 실패:", error);
    return NextResponse.json(
      { error: "북마크 제거 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

