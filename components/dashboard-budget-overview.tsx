
import Link from "next/link";

import {
    CATEGORY_LABELS,
    formatVND,
} from "@/lib/finance";

import {
    BUDGET_CATEGORIES,
} from "@/lib/budget-validation";

// ==========================================
// FINANCE PLANNER V1.0
// DASHBOARD BUDGET OVERVIEW
// ==========================================

type BudgetCategory =
    (typeof BUDGET_CATEGORIES)[number];

export type DashboardBudgetItem = {
    category: BudgetCategory;
    limitAmount: number;
    spentAmount: number;
};

type DashboardBudgetOverviewProps = {
    month: string;
    items: DashboardBudgetItem[];
};

// ==========================================
// 1. XÁC ĐỊNH TRẠNG THÁI NGÂN SÁCH
// ==========================================

function getBudgetStatus(percentage: number) {
    if (percentage > 100) {
        return {
            label: "Vượt ngân sách",
            barColor: "bg-red-500",
            textColor:
                "text-red-600 dark:text-red-400",
        };
    }

    if (percentage >= 100) {
        return {
            label: "Đã hết hạn mức",
            barColor: "bg-red-500",
            textColor:
                "text-red-600 dark:text-red-400",
        };
    }

    if (percentage >= 80) {
        return {
            label: "Sắp đạt hạn mức",
            barColor: "bg-amber-500",
            textColor:
                "text-amber-600 dark:text-amber-400",
        };
    }

    return {
        label: "Trong hạn mức",
        barColor: "bg-emerald-500",
        textColor:
            "text-emerald-600 dark:text-emerald-400",
    };
}

// ==========================================
// 2. THẺ THỐNG KÊ
// ==========================================

function BudgetSummaryCard({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-line bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">
                {label}
            </p>

            <p className="mt-2 break-words text-xl font-bold tabular-nums text-foreground">
                {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

// ==========================================
// 3. COMPONENT TỔNG QUAN NGÂN SÁCH
// ==========================================

export function DashboardBudgetOverview({
    month,
    items,
}: DashboardBudgetOverviewProps) {
    const [year, monthNumber] = month.split("-");

    // Tính tổng hạn mức.
    const totalBudget = items.reduce(
        (sum, item) => sum + item.limitAmount,
        0
    );

    // Chỉ tính chi tiêu của các danh mục
    // đã thiết lập ngân sách.
    const totalSpent = items.reduce(
        (sum, item) => sum + item.spentAmount,
        0
    );

    const remaining = totalBudget - totalSpent;

    // Chuẩn bị dữ liệu tiến độ.
    const budgets = items
        .map((item) => {
            const percentage =
                item.limitAmount > 0
                    ? (item.spentAmount / item.limitAmount) *
                    100
                    : 0;

            return {
                ...item,
                percentage,
                status: getBudgetStatus(percentage),
            };
        })
        // Đưa danh mục có tỷ lệ chi cao lên trước.
        .sort(
            (a, b) => b.percentage - a.percentage
        );

    const overBudgetCount = budgets.filter(
        (item) => item.percentage > 100
    ).length;

    const warningCount = budgets.filter(
        (item) =>
            item.percentage >= 80 &&
            item.percentage <= 100
    ).length;

    const budgetUrl =
        `/budgets?month=${encodeURIComponent(month)}`;

    return (
        <section
            aria-labelledby="dashboard-budget-heading"
            className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
        >
            {/* HEADER */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2
                        id="dashboard-budget-heading"
                        className="text-xl font-bold text-foreground"
                    >
                        Tổng quan ngân sách
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Tháng {Number(monthNumber)}/{year}
                    </p>
                </div>

                <Link
                    href={budgetUrl}
                    className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                    Quản lý ngân sách
                </Link>
            </div>

            {/* CHƯA CÓ NGÂN SÁCH */}
            {items.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-line bg-muted/20 px-5 py-10 text-center">
                    <h3 className="font-semibold text-foreground">
                        Chưa thiết lập ngân sách tháng này
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        Hãy tạo hạn mức cho các danh mục
                        để theo dõi chi tiêu ngay tại
                        Dashboard.
                    </p>

                    <Link
                        href={budgetUrl}
                        className="mt-5 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-background"
                    >
                        Tạo ngân sách
                    </Link>
                </div>
            ) : (
                <>
                    {/* 3 THẺ THỐNG KÊ */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <BudgetSummaryCard
                            label="Tổng hạn mức"
                            value={formatVND(totalBudget)}
                            description="Ngân sách đã thiết lập"
                        />

                        <BudgetSummaryCard
                            label="Đã chi"
                            value={formatVND(totalSpent)}
                            description="Chi tiêu trong danh mục có ngân sách"
                        />

                        <BudgetSummaryCard
                            label={
                                remaining >= 0
                                    ? "Còn lại"
                                    : "Vượt tổng hạn mức"
                            }
                            value={formatVND(
                                Math.abs(remaining)
                            )}
                            description={
                                remaining >= 0
                                    ? "Số tiền còn trong tổng hạn mức"
                                    : "Tổng chi đã vượt tổng ngân sách"
                            }
                        />
                    </div>

                    {/* CẢNH BÁO */}
                    {(overBudgetCount > 0 ||
                        warningCount > 0) && (
                            <div
                                role="status"
                                className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                            >
                                <p className="text-sm font-semibold text-foreground">
                                    Cần chú ý ngân sách
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {overBudgetCount > 0 &&
                                        `${overBudgetCount} danh mục đã vượt hạn mức.`}

                                    {overBudgetCount > 0 &&
                                        warningCount > 0 &&
                                        " "}

                                    {warningCount > 0 &&
                                        `${warningCount} danh mục đã sử dụng từ 80% đến 100%.`}
                                </p>
                            </div>
                        )}

                    {/* DANH SÁCH TIẾN ĐỘ */}
                    <div className="mt-6 space-y-5">
                        {budgets.slice(0, 4).map((item) => {
                            const barWidth = Math.min(
                                100,
                                Math.max(0, item.percentage)
                            );

                            return (
                                <div
                                    key={item.category}
                                    className="space-y-2"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {
                                                    CATEGORY_LABELS[
                                                    item.category
                                                    ]
                                                }
                                            </h3>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatVND(item.spentAmount)}
                                                {" / "}
                                                {formatVND(item.limitAmount)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-bold tabular-nums text-foreground">
                                                {Math.round(
                                                    item.percentage
                                                )}
                                                %
                                            </p>

                                            <p
                                                className={`text-xs ${item.status.textColor}`}
                                            >
                                                {item.status.label}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        role="progressbar"
                                        aria-label={`Ngân sách ${CATEGORY_LABELS[item.category]}`}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={Math.round(
                                            barWidth
                                        )}
                                        aria-valuetext={`${Math.round(item.percentage)}% ngân sách đã sử dụng`}
                                        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                                    >
                                        <div
                                            className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${item.status.barColor}`}
                                            style={{
                                                width: `${barWidth}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* XEM TOÀN BỘ */}
                    {budgets.length > 4 && (
                        <div className="mt-5 border-t border-line pt-4 text-center">
                            <Link
                                href={budgetUrl}
                                className="text-sm font-semibold text-brand hover:underline"
                            >
                                Xem tất cả {budgets.length} danh mục
                            </Link>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
