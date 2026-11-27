
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

import {
    getMonthlyTrend,
    getCategoryExpenses,
} from "@/lib/analytics";

import { FinanceCharts } from "@/components/finance-charts";

// ==========================================
// FINANCE PLANNER V1.1 - REPORTS PAGE
// ==========================================

export const metadata: Metadata = {
    title: "Báo cáo tài chính | Finance Planner",
    description:
        "Phân tích thu nhập, chi tiêu và xu hướng tài chính cá nhân.",
};

// Trang luôn kiểm tra session và tải dữ liệu mới.
export const dynamic = "force-dynamic";

// ==========================================
// 1. COMPONENT HIỂN THỊ THỐNG KÊ
// ==========================================

type SummaryCardProps = {
    title: string;
    amount: number;
    description: string;
    highlighted?: boolean;
};

function SummaryCard({
    title,
    amount,
    description,
    highlighted = false,
}: SummaryCardProps) {
    return (
        <article
            className={
                highlighted
                    ? "rounded-2xl border border-brand bg-brand p-5 text-white shadow-lg shadow-black/5 dark:text-background sm:p-6"
                    : "rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
            }
        >
            <p
                className={
                    highlighted
                        ? "text-sm font-medium opacity-85"
                        : "text-sm font-medium text-muted-foreground"
                }
            >
                {title}
            </p>

            <p className="mt-4 break-words text-2xl font-bold tabular-nums">
                {formatVND(amount)}
            </p>

            <p
                className={
                    highlighted
                        ? "mt-3 text-xs opacity-85"
                        : "mt-3 text-xs text-muted-foreground"
                }
            >
                {description}
            </p>
        </article>
    );
}

// ==========================================
// 2. SERVER COMPONENT - REPORTS
// ==========================================

export default async function ReportsPage() {
    // ========================================
    // BƯỚC 1: XÁC THỰC BETTER AUTH
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
    // BƯỚC 2: XÁC ĐỊNH KHOẢNG THỜI GIAN
    // ========================================

    const now = new Date();

    // Bao gồm tháng hiện tại và 5 tháng trước.
    const startDate = getVietnamMonthRange(
        now,
        -5
    ).gte;

    // Không lấy dữ liệu từ tháng kế tiếp.
    const endDate = getVietnamMonthRange(
        now
    ).lt;

    // ========================================
    // BƯỚC 3: LẤY DỮ LIỆU TỪ NEON
    // ========================================

    const transactions =
        await prisma.transaction.findMany({
            where: {
                userId: user.id,

                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },

            select: {
                type: true,
                amount: true,
                category: true,
                date: true,
            },

            orderBy: {
                date: "asc",
            },
        });

    // ========================================
    // BƯỚC 4: PHÂN TÍCH DỮ LIỆU
    // ========================================

    // Thu chi 6 tháng gần nhất.
    const monthly = getMonthlyTrend(
        transactions,
        now,
        6
    );

    // Chi tiêu theo danh mục trong tháng hiện tại.
    const categories = getCategoryExpenses(
        transactions,
        now
    );

    // ========================================
    // BƯỚC 5: TÍNH CÁC CHỈ SỐ TỔNG QUAN
    // ========================================

    const totalIncome = monthly.reduce(
        (sum, item) => sum + item.income,
        0
    );

    const totalExpense = monthly.reduce(
        (sum, item) => sum + item.expense,
        0
    );

    // Chênh lệch thu chi trong 6 tháng.
    const netBalance = totalIncome - totalExpense;

    // Tháng hiện tại luôn là phần tử cuối.
    const currentMonth = monthly.at(-1);

    const currentMonthExpense =
        currentMonth?.expense ?? 0;

    const hasTransactions = transactions.length > 0;

    // ========================================
    // BƯỚC 6: GIAO DIỆN REPORTS
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
                        Báo cáo tài chính
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Theo dõi thu nhập, chi tiêu và xu hướng
                        tài chính của bạn trong 6 tháng gần nhất.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                    Về Dashboard
                </Link>
            </header>

            {/* THỐNG KÊ TỔNG QUAN */}
            <section
                aria-label="Thống kê tài chính"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                <SummaryCard
                    title="Thu nhập 6 tháng"
                    amount={totalIncome}
                    description="Tổng các khoản thu trong kỳ"
                />

                <SummaryCard
                    title="Chi tiêu 6 tháng"
                    amount={totalExpense}
                    description="Tổng các khoản chi trong kỳ"
                />

                <SummaryCard
                    title="Chênh lệch 6 tháng"
                    amount={netBalance}
                    description="Thu nhập trừ chi tiêu trong kỳ"
                    highlighted
                />

                <SummaryCard
                    title="Chi tiêu tháng này"
                    amount={currentMonthExpense}
                    description="Theo tháng hiện tại tại Việt Nam"
                />
            </section>

            {/* PHẦN GIỚI THIỆU BIỂU ĐỒ */}
            <section className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            Phân tích dòng tiền
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Các biểu đồ được tạo từ giao dịch
                            thuộc tài khoản đang đăng nhập.
                        </p>
                    </div>

                    <span className="rounded-full border border-line bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                        6 tháng gần nhất
                    </span>
                </div>
            </section>

            {/* BIỂU ĐỒ */}
            <FinanceCharts
                monthly={monthly}
                categories={categories}
            />

            {/* GHI CHÚ / TRẠNG THÁI DỮ LIỆU */}
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">
                            Dữ liệu báo cáo
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {hasTransactions
                                ? `Đã phân tích ${transactions.length} giao dịch trong kỳ báo cáo.`
                                : "Chưa có giao dịch trong kỳ báo cáo."}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                            Số liệu được phân loại theo tháng
                            tại Việt Nam (UTC+7).
                            Chênh lệch trong báo cáo không
                            phải số dư tích lũy toàn thời gian.
                        </p>
                    </div>

                    <Link
                        href="/transactions"
                        className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:text-background"
                    >
                        Quản lý giao dịch
                    </Link>
                </div>
            </section>
        </main>
    );
}
