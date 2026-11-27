
import { describe, expect, it } from "vitest";

import { CATEGORY_LABELS } from "@/lib/finance";

import {
    getVietnamMonthKey,
    getMonthlyTrend,
    getCategoryExpenses,
    type AnalyticsCategory,
    type AnalyticsTransaction,
} from "@/lib/analytics";

// ==========================================
// FINANCE PLANNER V1.1 - ANALYTICS TESTS
// ==========================================

// Lấy danh mục thực tế từ finance.ts.
// Không tự đặt danh mục khác với dự án.
function getTestCategories(): [
    AnalyticsCategory,
    AnalyticsCategory,
] {
    const keys = Object.keys(
        CATEGORY_LABELS
    ) as AnalyticsCategory[];

    if (keys.length < 2) {
        throw new Error(
            "Cần ít nhất 2 danh mục để kiểm thử."
        );
    }

    return [keys[0]!, keys[1]!];
}

const [CATEGORY_A, CATEGORY_B] =
    getTestCategories();

// Tạo giao dịch mẫu, không dùng database thật.
function makeTransaction(
    type: AnalyticsTransaction["type"],
    amount: number,
    date: string,
    category: AnalyticsCategory = CATEGORY_A
): AnalyticsTransaction {
    return {
        type,
        amount,
        date: new Date(date),
        category,
    };
}

// ==========================================
// GROUP 1 - VIETNAM TIMEZONE
// ==========================================

describe("Analytics - Vietnam timezone", () => {
    it("Xác định tháng thông thường", () => {
        expect(
            getVietnamMonthKey(
                new Date("2026-11-25T08:00:00Z")
            )
        ).toBe("2026-11");
    });

    it("Xử lý thời điểm ngay trước đầu tháng tại Việt Nam", () => {
        // 23:59:59 ngày 30/11, giờ Việt Nam.
        expect(
            getVietnamMonthKey(
                new Date("2026-11-30T16:59:59Z")
            )
        ).toBe("2026-11");
    });

    it("Xử lý thời điểm bắt đầu tháng mới tại Việt Nam", () => {
        // 00:00 ngày 01/12, giờ Việt Nam.
        expect(
            getVietnamMonthKey(
                new Date("2026-11-30T17:00:00Z")
            )
        ).toBe("2026-12");
    });

    it("Xử lý chuyển sang năm mới", () => {
        expect(
            getVietnamMonthKey(
                new Date("2025-12-31T17:00:00Z")
            )
        ).toBe("2026-01");
    });

    it("Từ chối ngày không hợp lệ", () => {
        expect(() =>
            getVietnamMonthKey(
                new Date("invalid")
            )
        ).toThrow("Ngày không hợp lệ");
    });
});

// ==========================================
// GROUP 2 - MONTHLY TREND
// ==========================================

describe("Analytics - Monthly trend", () => {
    const NOW = new Date(
        "2026-11-25T08:00:00Z"
    );

    it("Tạo đủ 6 tháng theo thứ tự", () => {
        const result = getMonthlyTrend(
            [],
            NOW,
            6
        );

        expect(result).toHaveLength(6);

        expect(
            result.map((month) => month.month)
        ).toEqual([
            "2026-06",
            "2026-07",
            "2026-08",
            "2026-09",
            "2026-10",
            "2026-11",
        ]);
    });

    it("Tháng không có giao dịch có giá trị bằng 0", () => {
        const result = getMonthlyTrend(
            [],
            NOW,
            3
        );

        for (const month of result) {
            expect(month.income).toBe(0);
            expect(month.expense).toBe(0);
            expect(month.balance).toBe(0);
        }
    });

    it("Cộng đúng thu nhập, chi tiêu và số dư", () => {
        const transactions = [
            makeTransaction(
                "INCOME",
                10000000,
                "2026-11-10T03:00:00Z"
            ),
            makeTransaction(
                "INCOME",
                2000000,
                "2026-11-12T03:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                3000000,
                "2026-11-15T03:00:00Z"
            ),
        ];

        const result = getMonthlyTrend(
            transactions,
            NOW,
            1
        );

        expect(result[0]).toMatchObject({
            month: "2026-11",
            income: 12000000,
            expense: 3000000,
            balance: 9000000,
        });
    });

    it("Không tính giao dịch ngoài khoảng tháng", () => {
        const transactions = [
            makeTransaction(
                "INCOME",
                5000000,
                "2026-10-15T03:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                1000000,
                "2026-11-10T03:00:00Z"
            ),
        ];

        const result = getMonthlyTrend(
            transactions,
            NOW,
            1
        );

        expect(result[0]).toMatchObject({
            income: 0,
            expense: 1000000,
            balance: -1000000,
        });
    });

    it("Phân biệt giao dịch trước và sau nửa đêm Việt Nam", () => {
        const transactions = [
            makeTransaction(
                "INCOME",
                100,
                "2026-11-30T16:59:59Z"
            ),
            makeTransaction(
                "INCOME",
                200,
                "2026-11-30T17:00:00Z"
            ),
        ];

        const result = getMonthlyTrend(
            transactions,
            new Date("2026-12-15T00:00:00Z"),
            2
        );

        expect(result.map((month) => ({
            month: month.month,
            income: month.income,
        }))).toEqual([
            { month: "2026-11", income: 100 },
            { month: "2026-12", income: 200 },
        ]);
    });

    it("Xử lý khoảng tháng qua năm mới", () => {
        const result = getMonthlyTrend(
            [],
            new Date("2026-01-05T00:00:00Z"),
            3
        );

        expect(
            result.map((month) => month.month)
        ).toEqual([
            "2025-11",
            "2025-12",
            "2026-01",
        ]);
    });

    it("Bỏ qua số tiền âm và không hợp lệ", () => {
        const transactions = [
            makeTransaction(
                "INCOME",
                -100,
                "2026-11-10T00:00:00Z"
            ),
            makeTransaction(
                "INCOME",
                Infinity,
                "2026-11-11T00:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                500,
                "2026-11-12T00:00:00Z"
            ),
        ];

        const result = getMonthlyTrend(
            transactions,
            NOW,
            1
        );

        expect(result[0]).toMatchObject({
            income: 0,
            expense: 500,
            balance: -500,
        });
    });

    it("Từ chối số tháng không hợp lệ", () => {
        for (const count of [0, -1, 2.5, 25]) {
            expect(() =>
                getMonthlyTrend([], NOW, count)
            ).toThrow();
        }
    });
});

// ==========================================
// GROUP 3 - CATEGORY EXPENSES
// ==========================================

describe("Analytics - Category expenses", () => {
    const NOW = new Date(
        "2026-11-25T08:00:00Z"
    );

    it("Trả về danh sách rỗng khi chưa có giao dịch", () => {
        expect(
            getCategoryExpenses([], NOW)
        ).toEqual([]);
    });

    it("Chỉ thống kê khoản chi trong tháng", () => {
        const transactions = [
            makeTransaction(
                "EXPENSE",
                300000,
                "2026-11-15T00:00:00Z"
            ),
            makeTransaction(
                "INCOME",
                2000000,
                "2026-11-15T00:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                1000000,
                "2026-10-15T00:00:00Z"
            ),
        ];

        const result = getCategoryExpenses(
            transactions,
            NOW
        );

        expect(result).toHaveLength(1);
        expect(result[0]?.amount).toBe(300000);
        expect(result[0]?.percentage).toBe(100);
    });

    it("Sắp xếp danh mục theo số tiền giảm dần", () => {
        const transactions = [
            makeTransaction(
                "EXPENSE",
                250000,
                "2026-11-10T00:00:00Z",
                CATEGORY_A
            ),
            makeTransaction(
                "EXPENSE",
                750000,
                "2026-11-11T00:00:00Z",
                CATEGORY_B
            ),
        ];

        const result = getCategoryExpenses(
            transactions,
            NOW
        );

        expect(result).toHaveLength(2);

        expect(result[0]).toEqual({
            category: CATEGORY_B,
            label: CATEGORY_LABELS[CATEGORY_B],
            amount: 750000,
            percentage: 75,
        });

        expect(result[1]).toEqual({
            category: CATEGORY_A,
            label: CATEGORY_LABELS[CATEGORY_A],
            amount: 250000,
            percentage: 25,
        });
    });

    it("Cộng nhiều khoản chi cùng danh mục", () => {
        const transactions = [
            makeTransaction(
                "EXPENSE",
                100000,
                "2026-11-10T00:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                200000,
                "2026-11-11T00:00:00Z"
            ),
        ];

        const result = getCategoryExpenses(
            transactions,
            NOW
        );

        expect(result).toHaveLength(1);
        expect(result[0]?.amount).toBe(300000);
        expect(result[0]?.percentage).toBe(100);
    });

    it("Bỏ qua chi phí không hợp lệ", () => {
        const transactions = [
            makeTransaction(
                "EXPENSE",
                0,
                "2026-11-10T00:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                -200,
                "2026-11-10T00:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                Number.NaN,
                "2026-11-10T00:00:00Z"
            ),
            makeTransaction(
                "EXPENSE",
                Infinity,
                "2026-11-10T00:00:00Z"
            ),
        ];

        expect(
            getCategoryExpenses(transactions, NOW)
        ).toEqual([]);
    });

    it("Sử dụng tháng Việt Nam khi phân loại", () => {
        const transactions = [
            makeTransaction(
                "EXPENSE",
                100,
                "2026-11-30T16:59:59Z"
            ),
            makeTransaction(
                "EXPENSE",
                200,
                "2026-11-30T17:00:00Z"
            ),
        ];

        const result = getCategoryExpenses(
            transactions,
            new Date("2026-12-15T00:00:00Z")
        );

        expect(result).toHaveLength(1);
        expect(result[0]?.amount).toBe(200);
    });
});
