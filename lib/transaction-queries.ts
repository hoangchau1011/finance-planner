
import type { Prisma } from "@/generated/prisma/client";
import { getVietnamMonthRange } from "@/lib/finance";
import type { TransactionFilters } from "@/lib/validation";

export function transactionWhere(
    userId: string,
    filters: TransactionFilters,
    now = new Date(),
): Prisma.TransactionWhereInput {
    return {
        userId,

        ...(filters.type
            ? { type: filters.type }
            : {}),

        ...(filters.category
            ? { category: filters.category }
            : {}),

        // V1.0 - Tìm kiếm mô tả giao dịch.
        // PostgreSQL so khớp không phân biệt chữ hoa/thường.
        ...(filters.q
            ? {
                description: {
                    contains: filters.q,
                    mode: "insensitive" as const,
                },
            }
            : {}),

        ...(filters.range === "all"
            ? {}
            : {
                date: getVietnamMonthRange(
                    now,
                    filters.range === "last-month" ? -1 : 0,
                ),
            }),
    };
}
