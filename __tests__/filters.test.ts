
import { describe, expect, it } from "vitest";

import { transactionWhere } from "@/lib/transaction-queries";
import { parseTransactionFilters } from "@/lib/validation";

// Thời điểm cố định để kết quả test không thay đổi theo ngày chạy
const now = new Date("2026-11-21T10:00:00+07:00");

describe("Transaction Filters - Prisma Query", () => {
    it("1. Luôn lọc theo userId khi chọn tất cả", () => {
        const where = transactionWhere(
            "user-123",
            { range: "all" },
            now,
        );

        expect(where).toEqual({
            userId: "user-123",
        });
    });

    it("2. Lọc đúng tháng hiện tại theo giờ Việt Nam", () => {
        const where = transactionWhere(
            "user-123",
            { range: "this-month" },
            now,
        );

        expect(where).toEqual({
            userId: "user-123",
            date: {
                gte: new Date("2026-10-31T17:00:00.000Z"),
                lt: new Date("2026-11-30T17:00:00.000Z"),
            },
        });
    });

    it("3. Lọc đúng tháng trước", () => {
        const where = transactionWhere(
            "user-123",
            { range: "last-month" },
            now,
        );

        expect(where).toEqual({
            userId: "user-123",
            date: {
                gte: new Date("2026-09-30T17:00:00.000Z"),
                lt: new Date("2026-10-31T17:00:00.000Z"),
            },
        });
    });

    it("4. Kết hợp cả ba bộ lọc", () => {
        const where = transactionWhere(
            "user-123",
            {
                range: "last-month",
                type: "EXPENSE",
                category: "FOOD",
            },
            now,
        );

        expect(where).toEqual({
            userId: "user-123",
            type: "EXPENSE",
            category: "FOOD",
            date: {
                gte: new Date("2026-09-30T17:00:00.000Z"),
                lt: new Date("2026-10-31T17:00:00.000Z"),
            },
        });
    });

    it("5. Không cho URL ghi đè userId", () => {
        const filters = parseTransactionFilters({
            range: "all",
            type: "INCOME",
            userId: "attacker-user",
        });

        const where = transactionWhere(
            "real-user",
            filters,
            now,
        );

        expect(where.userId).toBe("real-user");
        expect(where.type).toBe("INCOME");
        expect(where).not.toHaveProperty(
            "userId",
            "attacker-user",
        );
    });

    it("6. Xử lý đúng tháng 12 khi lọc tháng trước từ tháng 1", () => {
        const january = new Date(
            "2027-01-15T10:00:00+07:00",
        );

        const where = transactionWhere(
            "user-123",
            { range: "last-month" },
            january,
        );

        expect(where).toEqual({
            userId: "user-123",
            date: {
                gte: new Date("2026-11-30T17:00:00.000Z"),
                lt: new Date("2026-12-31T17:00:00.000Z"),
            },
        });
    });
});
