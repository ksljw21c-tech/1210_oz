import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { getUserBookmarks } from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import { createClient } from "@/lib/supabase/server";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import type { TourItem } from "@/lib/types/tour";

export const metadata: Metadata = {
  title: "내 북마크 | My Trip",
  description: "북마크한 관광지 목록을 확인하고 관리하세요",
};

/**
 * 북마크 목록 페이지
 *
 * 인증된 사용자의 북마크한 관광지 목록을 표시합니다.
 * Supabase에서 북마크 목록을 조회한 후, 한국관광공사 API로 관광지 정보를 가져옵니다.
 */
export default async function BookmarksPage() {
  // Clerk 인증 확인
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    redirect("/sign-in");
  }

  let bookmarks: TourItem[] = [];
  let error: Error | null = null;

  try {
    // Supabase에서 Clerk user ID로 사용자 찾기
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      throw new Error("사용자를 찾을 수 없습니다. 다시 로그인해주세요.");
    }

    // 북마크 목록 조회
    const bookmarkRecords = await getUserBookmarks(user.id);

    if (bookmarkRecords.length === 0) {
      // 북마크가 없는 경우 빈 배열 반환
      bookmarks = [];
    } else {
      // 각 북마크의 content_id에 대해 관광지 정보 병렬 조회
      const tourPromises = bookmarkRecords.map(async (bookmark) => {
        try {
          const tourDetail = await getDetailCommon({
            contentId: bookmark.content_id,
          });

          if (!tourDetail) {
            console.warn(`관광지 정보를 찾을 수 없음: ${bookmark.content_id}`);
            return null;
          }

          // TourDetail을 TourItem 형식으로 변환
          const tourItem: TourItem = {
            addr1: tourDetail.addr1,
            addr2: tourDetail.addr2,
            areacode: "", // TourDetail에는 areacode가 없으므로 빈 문자열
            contentid: tourDetail.contentid,
            contenttypeid: tourDetail.contenttypeid,
            title: tourDetail.title,
            mapx: tourDetail.mapx,
            mapy: tourDetail.mapy,
            firstimage: tourDetail.firstimage,
            firstimage2: tourDetail.firstimage2,
            tel: tourDetail.tel,
            cat1: tourDetail.cat1,
            cat2: tourDetail.cat2,
            cat3: tourDetail.cat3,
          };

          return tourItem;
        } catch (error) {
          console.error(`관광지 정보 조회 실패 (${bookmark.content_id}):`, error);
          return null; // 실패한 항목은 무시
        }
      });

      // 병렬 처리로 모든 관광지 정보 조회
      const tourResults = await Promise.allSettled(tourPromises);

      // 성공한 결과만 필터링
      bookmarks = tourResults
        .filter((result): result is PromiseFulfilledResult<TourItem | null> =>
          result.status === "fulfilled"
        )
        .map(result => result.value)
        .filter((tour): tour is TourItem => tour !== null);
    }
  } catch (err) {
    console.error("북마크 목록 조회 실패:", err);
    error = err instanceof Error ? err : new Error("북마크 목록을 불러오는 중 오류가 발생했습니다.");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">내 북마크</h1>
              <p className="text-sm text-muted-foreground mt-1">
                북마크한 관광지 목록을 확인하세요 ({bookmarks.length}개)
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <BookmarkList
          tours={bookmarks}
          isLoading={false}
          error={error}
          onRetry={() => {
            // 페이지 새로고침으로 재시도
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        />
      </main>
    </div>
  );
}
