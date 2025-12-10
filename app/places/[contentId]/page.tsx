import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getDetailCommon,
  getDetailIntro,
  getDetailImage,
  getDetailPetTour,
} from "@/lib/api/tour-api";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { DetailPetTour } from "@/components/tour-detail/detail-pet-tour";
import { DetailRecommendations } from "@/components/tour-detail/detail-recommendations";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";

/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 * Next.js 15 App Router의 동적 라우팅을 사용하며,
 * Server Component로 구현하여 성능을 최적화합니다.
 *
 * 주요 기능:
 * - 기본 정보 표시 (detail-info)
 * - 지도 표시 (detail-map)
 * - 공유 기능 (share-button)
 * - 북마크 기능 (bookmark-button)
 * - Open Graph 메타태그 (SEO 최적화)
 *
 * @dependencies
 * - tour-api: getDetailCommon API
 * - tour-detail: 상세 정보 컴포넌트들
 * - bookmarks: 북마크 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4 상세페이지)
 */

interface PageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 동적 메타데이터 생성 (Open Graph)
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const detail = await getDetailCommon({ contentId });

    if (!detail) {
      return {
        title: "관광지를 찾을 수 없습니다",
        description: "요청하신 관광지 정보를 찾을 수 없습니다.",
      };
    }

    // overview의 처음 100자 추출 (HTML 태그 제거)
    const description = detail.overview
      ? detail.overview
          .replace(/<[^>]*>/g, "")
          .substring(0, 100)
          .trim() + "..."
      : `${detail.title} 관광지 정보`;

    // 이미지 URL 처리 (상대 경로인 경우 절대 경로로 변환)
    let imageUrl = detail.firstimage;
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `https://api.visitkorea.or.kr${imageUrl}`;
    }

    const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/places/${contentId}`;

    return {
      title: `${detail.title} | My Trip`,
      description,
      openGraph: {
        title: detail.title,
        description,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: detail.title,
              },
            ]
          : [],
        url,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("메타데이터 생성 실패:", error);
    return {
      title: "관광지 상세정보 | My Trip",
      description: "관광지 상세 정보를 확인하세요.",
    };
  }
}

/**
 * 관광지 상세페이지
 */
export default async function TourDetailPage({ params }: PageProps) {
  const { contentId } = await params;

  // 관광지 기본 정보 조회 (필수)
  let detail;
  try {
    detail = await getDetailCommon({ contentId });
  } catch (error) {
    console.error("관광지 정보 조회 실패:", error);
    notFound();
  }

  // 데이터가 없으면 404
  if (!detail) {
    notFound();
  }

  // 병렬 API 호출 (성능 최적화)
  // detail이 있어야 contentTypeId를 알 수 있으므로, detail 조회 후 호출
  const [introResult, imagesResult, petInfoResult] = await Promise.allSettled([
    getDetailIntro({
      contentId,
      contentTypeId: detail.contenttypeid,
    }),
    getDetailImage({ contentId }),
    getDetailPetTour({ contentId }),
  ]);

  const intro =
    introResult.status === "fulfilled" ? introResult.value : null;
  const images =
    imagesResult.status === "fulfilled" ? imagesResult.value : [];
  const petInfo =
    petInfoResult.status === "fulfilled" ? petInfoResult.value : null;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 영역 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">뒤로가기</span>
              </Link>
            </Button>
            <h1 className="line-clamp-1 text-lg font-bold md:text-xl">
              {detail.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton contentId={contentId} title={detail.title} />
            <BookmarkButton
              contentId={contentId}
              title={detail.title}
            />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 기본 정보 섹션 */}
          <DetailInfo detail={detail} />

          {/* 이미지 갤러리 */}
          {images && images.length > 0 && (
            <DetailGallery images={images} firstImage={detail.firstimage} />
          )}

          {/* 운영 정보 섹션 */}
          {intro && <DetailIntro intro={intro} />}

          {/* 반려동물 정보 섹션 */}
          {petInfo && <DetailPetTour petInfo={petInfo} />}

          {/* 지도 섹션 */}
          {detail.mapx && detail.mapy && (
            <DetailMap
              title={detail.title}
              address={detail.addr1}
              mapx={detail.mapx}
              mapy={detail.mapy}
            />
          )}

          {/* 추천 관광지 섹션 */}
          <DetailRecommendations
            currentContentId={detail.contentid}
            areaCode={detail.areacode}
            contentTypeId={detail.contenttypeid}
            maxItems={6}
          />
        </div>
      </main>
    </div>
  );
}

