
import { CATEGORY_LABELS } from "@/lib/finance";

// ==========================================
// FINANCE PLANNER V1.1 - ANALYTICS
// ==========================================

// Việt Nam dùng UTC+7, không có DST.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export type AnalyticsCategory =
    keyof typeof CATEGORY_LABELS;

export type AnalyticsTransaction = {
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: AnalyticsCategory;
    date: Date;
};

export type MonthlySummary = {
    month: string;
    label: string;
    income: number;
    expense: number;
    balance: number;
};

export type CategoryExpense = {
    category: AnalyticsCategory;
    label: string;
    amount: number;
    percentage: number;
};

// ==========================================
// 1. XÁC ĐỊNH THÁNG THEO GIỜ VIỆT NAM
// ==========================================

export function getVietnamMonthKey(
    date: Date
): string {
    if (Number.isNaN(date.getTime())) {
        throw new Error("Ngày không hợp lệ.");
    }

    const vnDate = new Date(
        date.getTime() + VN_OFFSET_MS
    );

    const year = vnDate.getUTCFullYear();
    const month = vnDate.getUTCMonth() + 1;

    return `${year}-${String(month).padStart(2, "0")}`;
}

// ==========================================
// 2. THỐNG KÊ THU CHI CÁC THÁNG
// ==========================================

export function getMonthlyTrend(
    transactions: readonly AnalyticsTransaction[],
    now: Date = new Date(),
    monthCount = 6
): MonthlySummary[] {
    if (!Number.isInteger(monthCount) ||
        monthCount < 1 ||
        monthCount > 24) {
        throw new Error(
            "Số tháng phải nằm trong khoảng 1 đến 24."
        );
    }

    const vnNow = new Date(
        now.getTime() + VN_OFFSET_MS
    );

    const currentYear = vnNow.getUTCFullYear();
    const currentMonth = vnNow.getUTCMonth();

    const months: MonthlySummary[] = [];
    const monthMap = new Map<
        string,
        MonthlySummary
    >();

    // Tạo đủ số tháng, kể cả tháng không có giao dịch.
    for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date(
            Date.UTC(currentYear, currentMonth - i, 1)
        );

        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;

        const key =
            `${year}-${String(month).padStart(2, "0")}`;

        const summary: MonthlySummary = {
            month: key,
            label: `Th${month}/${year}`,
            income: 0,
            expense: 0,
            balance: 0,
        };

        months.push(summary);
        monthMap.set(key, summary);
    }

    // Cộng thu nhập và chi tiêu vào từng tháng.
    for (const transaction of transactions) {
        if (
            !Number.isFinite(transaction.amount) ||
            transaction.amount < 0
        ) {
            continue;
        }

        const monthKey = getVietnamMonthKey(
            transaction.date
        );

        const summary = monthMap.get(monthKey);

        if (!summary) continue;

        if (transaction.type === "INCOME") {
            summary.income += transaction.amount;
        } else if (transaction.type === "EXPENSE") {
            summary.expense += transaction.amount;
        }
    }

    // Tính chênh lệch thu chi từng tháng.
    for (const month of months) {
        month.balance = month.income - month.expense;
    }

    return months;
}

// ==========================================
// 3. THỐNG KÊ CHI TIÊU THEO DANH MỤC
// ==========================================

export function getCategoryExpenses(
    transactions: readonly AnalyticsTransaction[],
    now: Date = new Date()
): CategoryExpense[] {
    const targetMonth = getVietnamMonthKey(now);

    const totals = new Map<
        AnalyticsCategory,
        number
    >();

    for (const transaction of transactions) {
        // Chỉ thống kê khoản chi tiêu.
        if (transaction.type !== "EXPENSE") {
            continue;
        }

        if (
            !Number.isFinite(transaction.amount) ||
            transaction.amount <= 0
        ) {
            continue;
        }

        // Chỉ tính giao dịch trong tháng đang chọn.
        if (
            getVietnamMonthKey(transaction.date) !==
            targetMonth
        ) {
            continue;
        }

        const previous =
            totals.get(transaction.category) ?? 0;

        totals.set(
            transaction.category,
            previous + transaction.amount
        );
    }

    const totalExpense = [...totals.values()]
        .reduce((sum, value) => sum + value, 0);

    const result: CategoryExpense[] = [];

    for (const [category, amount] of totals) {
        result.push({
            category,
            label: CATEGORY_LABELS[category],
            amount,
            percentage:
                totalExpense > 0
                    ? Math.round(
                        (amount / totalExpense) * 100
                    )
                    : 0,
        });
    }

    // Danh mục chi tiêu nhiều nhất lên đầu.
    return result.sort(
        (a, b) => b.amount - a.amount
    );
}
