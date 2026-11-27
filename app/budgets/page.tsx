
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
    requireUser,
    UnauthorizedError,
} from "@/lib/dal";

import {
    formatVND,
    getVietnamMonthRange,
} from "@/lib/finance";

import { getVietnamMonthKey } from "@/lib/analytics";

import {
    BUDGET_CATEGORIES,
    budgetMonthSchema,
} from "@/lib/budget-validation";

import { BudgetForm } from "./budget-form";
import {
    BudgetList,
    type BudgetListItem,
} from "./budget-list";

// ==========================================
// FINANCE PLANNER V1.0 - BUDGETS PAGE
// ==========================================

export const metadata: Metadata = {
    title: "Ngân sách | Finance Planner",
    description:
        "Quản lý hạn mức chi tiêu theo tháng và danh mục.",
};

export const dynamic = "force-dynamic";

// Next.js 16: searchParams là Promise.
type BudgetsPageProps = {
    searchParams: Promise<{
        month?: string | string[];
    }>;
};

// ==========================================
// 1. KIỂM TRA DANH MỤC NGÂN SÁCH
// ==========================================

function isBudgetCategory(
    category: string
): category is BudgetListItem["category"] {
    return (
        BUDGET_CATEGORIES as readonly string[]
    ).includes(category);
}

// ==========================================
// 2. THẺ THỐNG KÊ
// ==========================================

type BudgetStatCardProps = {
    title: string;
    value: string;
    description: string;
    variant?: "default" | "warning";
};

function BudgetStatCard({
    title,
    value,
    description,
    variant = "default",
}: BudgetStatCardProps) {
    const isWarning = variant === "warning";

    return (
        <article
            className={`rounded-2xl border p-5 shadow-sm transition-colors sm:p-6 ${isWarning
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-line bg-card"
                }`}
        >
            <p className="text-sm font-medium text-muted-foreground">
                {title}
            </p>

            <p
                className={`mt-3 break-words text-2xl font-bold tabular-nums ${isWarning
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-foreground"
                    }`}
            >
                {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {description}
            </p>
        </article>
    );
}

// ==========================================
// 3. SERVER COMPONENT - BUDGETS
// ==========================================

export default async function BudgetsPage({
    searchParams,
}: BudgetsPageProps) {
    // ========================================
    // BƯỚC 1: KIỂM TRA SESSION BETTER AUTH
    // ========================================

    let user: Awaited<ReturnType<typeof requireUser>>;

    try {
        user = await requireUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            redirect("/login");
        }

        throw error;
    }

    // ========================================
    // BƯỚC 2: XÁC ĐỊNH THÁNG ĐANG CHỌN
    // ========================================

    const params = await searchParams;

    const currentMonth = getVietnamMonthKey(
        new Date()
    );

    const requestedMonth =
        typeof params.month === "string"
            ? params.month
            : undefined;

    // URL không hợp lệ thì dùng tháng hiện tại.
    const selectedMonth =
        requestedMonth &&
            budgetMonthSchema.safeParse(requestedMonth)
                .success
            ? requestedMonth
            : currentMonth;

    // Lấy một ngày giữa tháng đang chọn,
    // tránh lệch tháng do múi giờ server.
    const monthAnchor = new Date(
        `${selectedMonth}-15T12:00:00+07:00`
    );

    // Khoảng ngày chính xác theo giờ Việt Nam.
    const { gte, lt } = getVietnamMonthRange(
        monthAnchor
    );

    // ========================================
    // BƯỚC 3: TRUY VẤN NEON POSTGRESQL
    // ========================================

    const [budgetRecords, expenseGroups] =
        await Promise.all([
            // Ngân sách thuộc tài khoản đang đăng nhập.
            prisma.monthlyBudget.findMany({
                where: {
                    userId: user.id,
                    month: selectedMonth,
                },

                orderBy: [
                    { category: "asc" },
                    { createdAt: "asc" },
                ],

                select: {
                    id: true,
                    month: true,
                    category: true,
                    limitAmount: true,
                },
            }),

            // Tổng chi theo danh mục trong tháng.
            prisma.transaction.groupBy({
                by: ["category"],

                where: {
                    userId: user.id,
                    type: "EXPENSE",

                    date: {
                        gte,
                        lt,
                    },

                    category: {
                        in: [...BUDGET_CATEGORIES],
                    },
                },

                _sum: {
                    amount: true,
                },
            }),
        ]);

    // ========================================
    // BƯỚC 4: GHÉP NGÂN SÁCH VỚI CHI TIÊU
    // ========================================

    const spentByCategory = new Map(
        expenseGroups.map((row) => [
            row.category,
            row._sum.amount ?? 0,
        ])
    );

    // Chỉ hiển thị những danh mục ngân sách
    // được hỗ trợ trong ứng dụng.
    const items: BudgetListItem[] =
        budgetRecords.flatMap((budget) => {
            if (!isBudgetCategory(budget.category)) {
                return [];
            }

            return [
                {
                    id: budget.id,
                    month: budget.month,
                    category: budget.category,
                    limitAmount: budget.limitAmount,
                    spentAmount:
                        spentByCategory.get(budget.category) ?? 0,
                },
            ];
        });

    // ========================================
    // BƯỚC 5: TÍNH THỐNG KÊ TỔNG QUAN
    // ========================================

    const totalBudget = items.reduce(
        (sum, item) => sum + item.limitAmount,
        0
    );

    const totalSpent = items.reduce(
        (sum, item) => sum + item.spentAmount,
        0
    );

    const totalRemaining =
        totalBudget - totalSpent;

    const overBudgetCount = items.filter(
        (item) =>
            item.spentAmount > item.limitAmount
    ).length;

    const nearLimitCount = items.filter(
        (item) =>
            item.spentAmount >=
            item.limitAmount * 0.8 &&
            item.spentAmount <= item.limitAmount
    ).length;

    const [year, monthNumber] =
        selectedMonth.split("-");

    // ========================================
    // BƯỚC 6: GIAO DIỆN
    // ========================================

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">

            {/* HEADER */}
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-brand">
                        Finance Planner · v1.0
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Quản lý ngân sách
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Thiết lập hạn mức chi tiêu, theo dõi
                        ngân sách và kiểm soát tài chính
                        theo từng danh mục.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                    Về Dashboard
                </Link>
            </header>

            {/* ====================================
          BỘ LỌC THÁNG
      ==================================== */}
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-foreground">
                        Thời gian quản lý
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Đang xem ngân sách tháng{" "}
                        {monthNumber}/{year}
                    </p>
                </div>

                <form
                    action="/budgets"
                    method="get"
                    className="flex flex-wrap items-end gap-3"
                >
                    <div className="min-w-[180px] flex-1 space-y-2">
                        <label
                            htmlFor="budget-month-filter"
                            className="block text-sm font-medium text-foreground"
                        >
                            Chọn tháng
                        </label>

                        <input
                            id="budget-month-filter"
                            type="month"
                            name="month"
                            defaultValue={selectedMonth}
                            key={selectedMonth}
                            required
                            className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-background"
                    >
                        Xem ngân sách
                    </button>

                    <Link
                        href="/budgets"
                        className="rounded-xl border border-line px-5 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        Tháng hiện tại
                    </Link>
                </form>
            </section>

            {/* ====================================
          THỐNG KÊ NGÂN SÁCH
      ==================================== */}
            <section
                aria-label="Tổng quan ngân sách"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                <BudgetStatCard
                    title="Tổng hạn mức"
                    value={formatVND(totalBudget)}
                    description="Tổng ngân sách đã thiết lập"
                />

                <BudgetStatCard
                    title="Đã chi"
                    value={formatVND(totalSpent)}
                    description="Chi tiêu trong các danh mục có ngân sách"
                />

                <BudgetStatCard
                    title={
                        totalRemaining < 0
                            ? "Vượt tổng hạn mức"
                            : "Còn lại"
                    }
                    value={formatVND(
                        Math.abs(totalRemaining)
                    )}
                    description={
                        totalRemaining < 0
                            ? "Tổng chi vượt hạn mức đã đặt"
                            : "Tổng hạn mức trừ số tiền đã chi"
                    }
                    variant={
                        totalRemaining < 0
                            ? "warning"
                            : "default"
                    }
                />

                <BudgetStatCard
                    title="Danh mục vượt hạn mức"
                    value={String(overBudgetCount)}
                    description={`${nearLimitCount} danh mục đã sử dụng từ 80% đến 100%`}
                    variant={
                        overBudgetCount > 0
                            ? "warning"
                            : "default"
                    }
                />
            </section>

            {/* ====================================
          FORM THÊM NGÂN SÁCH
      ==================================== */}
            <section
                aria-labelledby="budget-form-heading"
                className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
            >
                <div className="mb-6">
                    <h2
                        id="budget-form-heading"
                        className="text-xl font-bold text-foreground"
                    >
                        Thêm ngân sách mới
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Đặt hạn mức cho từng danh mục
                        chi tiêu trong tháng.
                    </p>
                </div>

                <BudgetForm
                    key={selectedMonth}
                    defaultMonth={selectedMonth}
                />
            </section>

            {/* ====================================
          DANH SÁCH NGÂN SÁCH
      ==================================== */}
            <section
                aria-labelledby="budget-list-heading"
                className="space-y-5"
            >
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2
                            id="budget-list-heading"
                            className="text-xl font-bold text-foreground"
                        >
                            Danh sách ngân sách
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Theo dõi mức chi tiêu thực tế
                            và hạn mức của từng danh mục.
                        </p>
                    </div>

                    <span className="rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-foreground">
                        {items.length} danh mục
                    </span>
                </div>

                <BudgetList items={items} />
            </section>

            {/* ====================================
          THÔNG TIN VÀ LIÊN KẾT
      ==================================== */}
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                <h2 className="text-base font-semibold text-foreground">
                    Thông tin ngân sách
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Số tiền đã chi được tự động tính từ
                    các giao dịch chi tiêu trong tháng
                    tại Việt Nam (UTC+7).
                    Khi bạn thêm, sửa hoặc xóa giao dịch,
                    số liệu ngân sách sẽ thay đổi tương ứng.
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                    Thống kê tổng quan chỉ tính các danh mục
                    đã thiết lập hạn mức ngân sách.
                    Các khoản chi thuộc danh mục chưa có
                    ngân sách không nằm trong tổng này.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/transactions"
                        className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-background"
                    >
                        Quản lý giao dịch
                    </Link>

                    <Link
                        href="/reports"
                        className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        Xem báo cáo tài chính
                    </Link>
                </div>
            </section>
        </main>
    );
}
