import { NextResponse } from "next/server";

/**
 * @file route.ts
 * @description Supabase 설정 확인 API Route
 *
 * 북마크 기능 구현을 위한 Supabase 데이터베이스 설정을 확인합니다.
 * 개발 환경에서 RLS가 비활성화되어 있는지, 테이블과 인덱스가 올바르게 설정되어 있는지 검증합니다.
 *
 * @dependencies
 * - Supabase 클라이언트 (서버 사이드)
 *
 * @see {@link /supabase/migrations/db.sql} - 데이터베이스 스키마
 * @see {@link /docs/PRD.md} - 북마크 기능 요구사항
 */

interface VerificationResult {
  success: boolean;
  message: string;
  details?: any;
}

interface SupabaseVerificationReport {
  timestamp: string;
  environment: "development" | "production";
  results: {
    environment: VerificationResult;
    tables: VerificationResult;
    indexes: VerificationResult;
    rls: VerificationResult;
    permissions: VerificationResult;
    relationships: VerificationResult;
  };
  recommendations: string[];
}

/**
 * Supabase 설정 확인
 */
export async function GET() {
  try {
    const report: SupabaseVerificationReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV === "production" ? "production" : "development",
      results: {
        environment: { success: false, message: "" },
        tables: { success: false, message: "" },
        indexes: { success: false, message: "" },
        rls: { success: false, message: "" },
        permissions: { success: false, message: "" },
        relationships: { success: false, message: "" },
      },
      recommendations: [],
    };

    // 1. 환경변수 확인
    report.results.environment = await verifyEnvironment();

    // 환경변수가 올바르지 않으면 나머지 검증 중단
    if (!report.results.environment.success) {
      report.recommendations.push("환경변수를 올바르게 설정해주세요.");
      return NextResponse.json(report);
    }

    // 2. Supabase 연결 테스트
    const supabase = await import("@/lib/supabase/server").then(m => m.createClient());

    // 3. 테이블 존재 및 구조 확인
    report.results.tables = await verifyTables(supabase);

    // 4. 인덱스 확인
    report.results.indexes = await verifyIndexes(supabase);

    // 5. RLS 정책 확인
    report.results.rls = await verifyRLS(supabase);

    // 6. 권한 확인
    report.results.permissions = await verifyPermissions(supabase);

    // 7. 관계 확인
    report.results.relationships = await verifyRelationships(supabase);

    // 권장사항 생성
    if (!report.results.rls.success && report.environment === "development") {
      report.recommendations.push("개발 환경에서는 RLS를 비활성화하는 것이 좋습니다.");
    }

    if (!report.results.indexes.success) {
      report.recommendations.push("북마크 조회 성능을 위해 인덱스가 필요합니다.");
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Supabase 설정 확인 실패:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Supabase 설정 확인 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 환경변수 확인
 */
async function verifyEnvironment(): Promise<VerificationResult> {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    return {
      success: false,
      message: `필수 환경변수가 설정되지 않았습니다: ${missingVars.join(", ")}`,
    };
  }

  // 환경변수 형식이 올바른지 확인
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url.startsWith("https://")) {
    return {
      success: false,
      message: "NEXT_PUBLIC_SUPABASE_URL이 올바른 HTTPS URL 형식이 아닙니다.",
    };
  }

  if (!anonKey || anonKey.length < 100) {
    return {
      success: false,
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY가 올바른 형식이 아닙니다.",
    };
  }

  return {
    success: true,
    message: "환경변수가 올바르게 설정되었습니다.",
  };
}

/**
 * 테이블 존재 및 구조 확인
 */
async function verifyTables(supabase: any): Promise<VerificationResult> {
  try {
    // users 테이블 확인
    const { data: usersTable, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError && !usersError.message.includes("Row Level Security")) {
      return {
        success: false,
        message: "users 테이블이 존재하지 않거나 접근할 수 없습니다.",
        details: { error: usersError.message },
      };
    }

    // bookmarks 테이블 확인
    const { data: bookmarksTable, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("*")
      .limit(1);

    if (bookmarksError && !bookmarksError.message.includes("Row Level Security")) {
      return {
        success: false,
        message: "bookmarks 테이블이 존재하지 않거나 접근할 수 없습니다.",
        details: { error: bookmarksError.message },
      };
    }

    return {
      success: true,
      message: "users 및 bookmarks 테이블이 정상적으로 존재합니다.",
    };
  } catch (error) {
    return {
      success: false,
      message: "테이블 확인 중 오류가 발생했습니다.",
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * 인덱스 확인
 */
async function verifyIndexes(supabase: any): Promise<VerificationResult> {
  try {
    // PostgreSQL 시스템 카탈로그에서 인덱스 확인
    const { data: indexes, error } = await supabase.rpc("sql", {
      query: `
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename IN ('users', 'bookmarks')
        ORDER BY tablename, indexname;
      `,
    });

    if (error) {
      // RPC가 실패하면 간단한 확인으로 대체
      return {
        success: false,
        message: "인덱스 정보를 확인할 수 없습니다. Supabase Dashboard에서 수동 확인해주세요.",
        details: { error: error.message },
      };
    }

    const expectedIndexes = [
      "idx_bookmarks_user_id",
      "idx_bookmarks_content_id",
      "idx_bookmarks_created_at",
    ];

    const existingIndexes = indexes?.map((idx: any) => idx.indexname) || [];
    const missingIndexes = expectedIndexes.filter(
      idx => !existingIndexes.includes(idx)
    );

    if (missingIndexes.length > 0) {
      return {
        success: false,
        message: `필수 인덱스가 누락되었습니다: ${missingIndexes.join(", ")}`,
        details: { existing: existingIndexes, missing: missingIndexes },
      };
    }

    return {
      success: true,
      message: `모든 필수 인덱스가 존재합니다: ${expectedIndexes.join(", ")}`,
      details: { indexes: existingIndexes },
    };
  } catch (error) {
    return {
      success: false,
      message: "인덱스 확인 중 오류가 발생했습니다.",
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * RLS (Row Level Security) 정책 확인
 */
async function verifyRLS(supabase: any): Promise<VerificationResult> {
  try {
    // PostgreSQL 시스템 카탈로그에서 RLS 상태 확인
    const { data: rlsStatus, error } = await supabase.rpc("sql", {
      query: `
        SELECT
          schemaname,
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename IN ('users', 'bookmarks');
      `,
    });

    if (error) {
      return {
        success: false,
        message: "RLS 상태를 확인할 수 없습니다. Supabase Dashboard에서 수동 확인해주세요.",
        details: { error: error.message },
      };
    }

    const tablesWithRLSEnabled = rlsStatus?.filter((table: any) => table.rls_enabled) || [];

    if (tablesWithRLSEnabled.length > 0) {
      return {
        success: false,
        message: `RLS가 활성화된 테이블이 있습니다: ${tablesWithRLSEnabled.map((t: any) => t.tablename).join(", ")}`,
        details: { rlsEnabledTables: tablesWithRLSEnabled },
      };
    }

    return {
      success: true,
      message: "모든 테이블의 RLS가 비활성화되어 있습니다 (개발 환경에 적합).",
      details: { tables: rlsStatus },
    };
  } catch (error) {
    return {
      success: false,
      message: "RLS 상태 확인 중 오류가 발생했습니다.",
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * 권한 확인
 */
async function verifyPermissions(supabase: any): Promise<VerificationResult> {
  try {
    // 실제 데이터베이스 작업으로 권한 테스트
    const testResults = {
      users: false,
      bookmarks: false,
    };

    // users 테이블 권한 테스트
    try {
      const { error } = await supabase.from("users").select("count").limit(1).single();
      testResults.users = !error || error.message.includes("Row Level Security");
    } catch {
      testResults.users = false;
    }

    // bookmarks 테이블 권한 테스트
    try {
      const { error } = await supabase.from("bookmarks").select("count").limit(1).single();
      testResults.bookmarks = !error || error.message.includes("Row Level Security");
    } catch {
      testResults.bookmarks = false;
    }

    const hasPermission = testResults.users && testResults.bookmarks;

    if (!hasPermission) {
      const failedTables = Object.entries(testResults)
        .filter(([, hasAccess]) => !hasAccess)
        .map(([table]) => table);

      return {
        success: false,
        message: `다음 테이블에 대한 권한이 없습니다: ${failedTables.join(", ")}`,
        details: testResults,
      };
    }

    return {
      success: true,
      message: "users 및 bookmarks 테이블에 대한 권한이 정상적으로 설정되어 있습니다.",
      details: testResults,
    };
  } catch (error) {
    return {
      success: false,
      message: "권한 확인 중 오류가 발생했습니다.",
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * 관계 확인
 */
async function verifyRelationships(supabase: any): Promise<VerificationResult> {
  try {
    // PostgreSQL 시스템 카탈로그에서 외래키 제약조건 확인
    const { data: constraints, error } = await supabase.rpc("sql", {
      query: `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name IN ('bookmarks')
          AND tc.table_schema = 'public';
      `,
    });

    if (error) {
      return {
        success: false,
        message: "외래키 관계를 확인할 수 없습니다. Supabase Dashboard에서 수동 확인해주세요.",
        details: { error: error.message },
      };
    }

    // bookmarks.user_id → users.id 관계 확인
    const userForeignKey = constraints?.find(
      (c: any) =>
        c.table_name === "bookmarks" &&
        c.column_name === "user_id" &&
        c.foreign_table_name === "users" &&
        c.foreign_column_name === "id"
    );

    if (!userForeignKey) {
      return {
        success: false,
        message: "bookmarks.user_id → users.id 외래키 관계가 설정되지 않았습니다.",
        details: { constraints: constraints },
      };
    }

    return {
      success: true,
      message: "외래키 관계가 올바르게 설정되어 있습니다.",
      details: { foreignKeys: constraints },
    };
  } catch (error) {
    return {
      success: false,
      message: "관계 확인 중 오류가 발생했습니다.",
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}
