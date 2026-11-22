
import { NextResponse } from "next/server";

import { requireUser, UnauthorizedError } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { parseTransactionFilters } from "@/lib/validation";
import { transactionWhere } from "@/lib/transaction-queries";

// Luôn xử lý request mới, không cache dữ liệu cá nhân.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ==========================================
// FP3 - GET /api/transactions
// ==========================================

export async function GET(request: Request) {
    // ========================================
    // 1. XÁC THỰC BETTER AUTH SESSION
    // ========================================

    let user: Awaited<ReturnType<typeof requireUser>>;

    try {
        user = await requireUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Bạn cần đăng nhập để xem giao dịch.",
                },
                {
                    status: 401,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        // Không tiết lộ thông tin lỗi hệ thống ra API.
        return NextResponse.json(
            {
                success: false,
                error: "Không thể xác minh quyền truy cập.",
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }

    // ========================================
    // 2. ĐỌC VÀ CHUẨN HÓA BỘ LỌC URL
    // ========================================

    const url = new URL(request.url);

    const filters = parseTransactionFilters({
        range: url.searchParams.get("range") ?? undefined,
        type: url.searchParams.get("type") ?? undefined,
        category: url.searchParams.get("category") ?? undefined,
    });

    // ========================================
    // 3. TRUY VẤN GIAO DỊCH THEO USER ID
    // ========================================

    try {
        const transactions = await prisma.transaction.findMany({
            // user.id lấy từ session Better Auth.
            // Không lấy userId từ URL hoặc request body.
            where: transactionWhere(user.id, filters),

            orderBy: [
                { date: "desc" },
                { id: "desc" },
            ],

            select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                category: true,
                date: true,
                createdAt: true,
            },
        });

        // ======================================
        // 4. TRẢ DỮ LIỆU THÀNH CÔNG
        // ======================================

        return NextResponse.json(
            {
                success: true,
                count: transactions.length,
                filters,
                transactions,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "private, no-store",
                },
            }
        );
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Không thể tải danh sách giao dịch.",
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
