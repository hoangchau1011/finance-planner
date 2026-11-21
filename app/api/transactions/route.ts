
import { NextResponse } from "next/server";

import {
    requireUser,
    UnauthorizedError,
} from "@/lib/dal";

import { prisma } from "@/lib/prisma";
import { parseTransactionFilters } from "@/lib/validation";
import { transactionWhere } from "@/lib/transaction-queries";

export const dynamic = "force-dynamic";

// GET /api/transactions
export async function GET(request: Request) {
    // Kiểm tra quyền truy cập trước khi đọc dữ liệu
    let user: Awaited<ReturnType<typeof requireUser>>;

    try {
        user = await requireUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                {
                    error: "Bạn cần đăng nhập để xem giao dịch.",
                },
                {
                    status: 401,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                },
            );
        }

        return NextResponse.json(
            {
                error: "Không thể xác minh quyền truy cập.",
            },
            { status: 500 },
        );
    }

    // Đọc bộ lọc từ URL
    const url = new URL(request.url);

    const filters = parseTransactionFilters({
        range: url.searchParams.get("range") ?? undefined,
        type: url.searchParams.get("type") ?? undefined,
        category: url.searchParams.get("category") ?? undefined,
    });

    try {
        // Chỉ lấy dữ liệu thuộc user hiện tại
        const transactions = await prisma.transaction.findMany({
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
            },
        );
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Không thể tải danh sách giao dịch.",
            },
            { status: 500 },
        );
    }
}
