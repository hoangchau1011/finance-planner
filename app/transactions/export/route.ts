
import type { NextRequest } from "next/server";

import {
    requireUser,
    UnauthorizedError,
} from "@/lib/dal";

import { prisma } from "@/lib/prisma";

import {
    CATEGORY_LABELS,
    formatVietnamDateInput,
} from "@/lib/finance";

import {
    parseTransactionFilters,
} from "@/lib/validation";

import {
    transactionWhere,
} from "@/lib/transaction-queries";

// ==========================================
// FINANCE PLANNER V1.0
// TRANSACTION CSV EXPORT
// ==========================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ==========================================
// 1. CHUYỂN GIÁ TRỊ THÀNH Ô CSV AN TOÀN
// ==========================================

function escapeCsvCell(
    value: string | number
): string {
    // Loại bỏ các ký tự điều khiển có thể
    // làm ảnh hưởng đến định dạng CSV.
    const cleaned = String(value).replace(
        /[\u0000-\u001F\u007F]/g,
        " "
    );

    // Ngăn nội dung mô tả bị Excel hiểu
    // thành công thức khi mở file.
    const safeValue = /^\s*[=+\-@]/.test(
        cleaned
    )
        ? `'${cleaned}`
        : cleaned;

    // Escape dấu nháy kép đúng chuẩn CSV.
    return `"${safeValue.replace(/"/g, '""')}"`;
}

// ==========================================
// 2. CHUYỂN MỘT DÒNG THÀNH CSV
// ==========================================

function toCsvRow(
    values: Array<string | number>
): string {
    return values
        .map(escapeCsvCell)
        .join(",");
}

// ==========================================
// 3. API GET - XUẤT GIAO DỊCH
// ==========================================

export async function GET(
    request: NextRequest
) {
    // ========================================
    // BƯỚC 1: KIỂM TRA SESSION BETTER AUTH
    // ========================================

    let user: Awaited<ReturnType<typeof requireUser>>;

    try {
        user = await requireUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return new Response(
                "Vui lòng đăng nhập để xuất giao dịch.",
                {
                    status: 401,
                    headers: {
                        "Content-Type":
                            "text/plain; charset=utf-8",
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        throw error;
    }

    // ========================================
    // BƯỚC 2: ĐỌC BỘ LỌC TỪ URL
    // ========================================

    const searchParams =
        request.nextUrl.searchParams;

    const filters = parseTransactionFilters({
        range:
            searchParams.get("range") ?? undefined,

        type:
            searchParams.get("type") ?? undefined,

        category:
            searchParams.get("category") ?? undefined,

        q:
            searchParams.get("q") ?? undefined,
    });

    // ========================================
    // BƯỚC 3: TRUY VẤN NEON
    // ========================================

    const transactions =
        await prisma.transaction.findMany({
            where: transactionWhere(
                user.id,
                filters
            ),

            orderBy: [
                { date: "desc" },
                { id: "desc" },
            ],

            select: {
                date: true,
                type: true,
                category: true,
                description: true,
                amount: true,
            },
        });

    // ========================================
    // BƯỚC 4: TẠO NỘI DUNG CSV
    // ========================================

    const header = toCsvRow([
        "Ngày",
        "Loại giao dịch",
        "Danh mục",
        "Mô tả",
        "Số tiền (VND)",
    ]);

    const rows = transactions.map(
        (transaction) => {
            const typeLabel =
                transaction.type === "INCOME"
                    ? "Thu nhập"
                    : "Chi tiêu";

            const categoryLabel =
                CATEGORY_LABELS[
                transaction.category
                ];

            return toCsvRow([
                formatVietnamDateInput(
                    transaction.date
                ),
                typeLabel,
                categoryLabel,
                transaction.description,
                transaction.amount,
            ]);
        }
    );

    // BOM giúp Excel nhận tiếng Việt UTF-8.
    const csv = "\uFEFF" +
        [header, ...rows].join("\r\n") +
        "\r\n";

    // ========================================
    // BƯỚC 5: TRẢ FILE CHO TRÌNH DUYỆT
    // ========================================

    return new Response(csv, {
        status: 200,

        headers: {
            "Content-Type":
                "text/csv; charset=utf-8",

            "Content-Disposition":
                'attachment; filename="finance-planner-giao-dich.csv"',

            "Cache-Control":
                "private, no-store",

            "X-Content-Type-Options":
                "nosniff",
        },
    });
}
