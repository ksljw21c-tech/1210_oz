import { createClient } from "@/lib/supabase/server";

/**
 * @file supabase-api.ts
 * @description Supabase 북마크 API
 *
 * 북마크 관련 데이터베이스 작업을 수행하는 함수들입니다.
 * Clerk 인증과 연동되어 사용자별 북마크를 관리합니다.
 *
 * 주요 기능:
 * - 북마크 조회
 * - 북마크 추가
 * - 북마크 제거
 * - 사용자 북마크 목록 조회
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/supabase/server: 서버 사이드 Supabase 클라이언트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 * @see {@link /supabase/migrations/db.sql} - 북마크 테이블 스키마
 */

/**
 * 북마크 인터페이스
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * 북마크 조회
 * 특정 사용자가 특정 관광지를 북마크했는지 확인합니다.
 *
 * @param userId - 사용자 ID (Clerk user ID)
 * @param contentId - 관광지 ID (한국관광공사 API contentid)
 * @returns 북마크 정보 (없으면 null)
 */
export async function getBookmark(
  userId: string,
  contentId: string
): Promise<Bookmark | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .single();

    if (error) {
      // 데이터가 없으면 null 반환 (에러가 아님)
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("북마크 조회 실패:", error);
    throw error;
  }
}

/**
 * 북마크 추가
 * 사용자의 북마크 목록에 관광지를 추가합니다.
 *
 * @param userId - 사용자 ID (Clerk user ID)
 * @param contentId - 관광지 ID (한국관광공사 API contentid)
 * @param title - 관광지명 (선택, 빠른 조회용)
 * @returns 추가된 북마크 정보
 */
export async function addBookmark(
  userId: string,
  contentId: string,
  title?: string
): Promise<Bookmark> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // 중복 북마크인 경우 기존 북마크 반환
      if (error.code === "23505") {
        const existing = await getBookmark(userId, contentId);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("북마크 추가 실패:", error);
    throw error;
  }
}

/**
 * 북마크 제거
 * 사용자의 북마크 목록에서 관광지를 제거합니다.
 *
 * @param userId - 사용자 ID (Clerk user ID)
 * @param contentId - 관광지 ID (한국관광공사 API contentid)
 * @returns 성공 여부
 */
export async function removeBookmark(
  userId: string,
  contentId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("북마크 제거 실패:", error);
    throw error;
  }
}

/**
 * 사용자 북마크 목록 조회
 * 특정 사용자의 모든 북마크를 조회합니다.
 *
 * @param userId - 사용자 ID (Clerk user ID)
 * @returns 북마크 목록 (최신순 정렬)
 */
export async function getUserBookmarks(
  userId: string
): Promise<Bookmark[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("북마크 목록 조회 실패:", error);
    throw error;
  }
}

