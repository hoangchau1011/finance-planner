
import Link from "next/link";
import { redirect } from "next/navigation";

import { UnauthorizedError, requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import {
  CATEGORY_LABELS,
  formatVND,
  getVietnamMonthRange,

} from "@/lib/finance";

import {
  getMonthlyTrend,
  getCategoryExpenses,
} from "@/lib/analytics";

import { FinanceCharts } from "@/components/finance-charts";


import {
  DashboardBudgetOverview,
  type DashboardBudgetItem,
} from "@/components/dashboard-budget-overview";

import { getVietnamMonthKey } from "@/lib/analytics";

import { BUDGET_CATEGORIES } from "@/lib/budget-validation";

import { DashboardStatCard } from "@/components/dashboard-stat-card";



export const dynamic = "force-dynamic";

const PRIORITY_LABELS = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
} as const;

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(value);
}


// ==========================================
// V1.0 - KIỂM TRA DANH MỤC NGÂN SÁCH
// ==========================================

function isBudgetCategory(
  category: string
): category is DashboardBudgetItem["category"] {
  return (
    BUDGET_CATEGORIES as readonly string[]
  ).includes(category);
}


export default async function DashboardPage() {

  // fp3: Bảo vệ Dashboard bằng Better Auth session.
  let user: Awaited<ReturnType<typeof requireUser>>;

  try {
    // Lấy người dùng từ session đã xác thực.
    user = await requireUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      // Chưa đăng nhập => chuyển đến trang đăng nhập.
      redirect("/login");
    }

    // Các lỗi khác phải được xử lý như lỗi hệ thống.
    throw error;
  }



  const userId = user.id;

  // Dùng chung một thời điểm cho Dashboard.
  const now = new Date();

  // Khoảng thời gian tháng hiện tại theo giờ Việt Nam.
  const currentMonth = getVietnamMonthRange(now);

  // Mã tháng dùng để truy vấn ngân sách.
  const budgetMonthKey = getVietnamMonthKey(now);



  // Ngày đầu tiên của khoảng 6 tháng:
  // tháng hiện tại và 5 tháng trước.
  const reportStart = getVietnamMonthRange(
    now,
    -5
  ).gte;

  // Truy vấn dữ liệu theo đúng userId

  const [
    income,
    expense,
    categories,
    recent,
    wishes,
    count,
    reportTransactions,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "INCOME",
      },
    }),

    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "EXPENSE",
      },
    }),

    prisma.transaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        userId,
        type: "EXPENSE",
        date: currentMonth,
      },
      orderBy: {
        _sum: { amount: "desc" },
      },
    }),

    prisma.transaction.findMany({
      where: { userId },
      orderBy: [
        { date: "desc" },
        { id: "desc" },
      ],
      take: 6,
    }),


    prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      take: 4,

      select: {
        id: true,
        name: true,
        cost: true,
        savedAmount: true,
        priority: true,
      },

    }),



    prisma.transaction.count({
      where: { userId },
    }),

    // V1.0 - Giao dịch phục vụ biểu đồ 6 tháng.
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: reportStart,
          lt: currentMonth.lt,
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
    }),
  ]);


  // Tính số dư từ toàn bộ giao dịch
  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;
  const balance = totalIncome - totalExpense;

  const monthExpense = categories.reduce(
    (sum, row) => sum + (row._sum.amount ?? 0),
    0,
  );


  // ==========================================
  // V1.0 - DASHBOARD MONTHLY BUDGET
  // ==========================================

  // 1. Lấy ngân sách của user trong tháng.
  const monthlyBudgets =
    await prisma.monthlyBudget.findMany({
      where: {
        userId,
        month: budgetMonthKey,
      },

      select: {
        category: true,
        limitAmount: true,
      },

      orderBy: {
        category: "asc",
      },
    });

  // 2. Tận dụng dữ liệu EXPENSE đã tổng hợp
  // trong biến categories ở Dashboard.
  //
  // Không cần thực hiện groupBy lần thứ hai.
  const budgetSpentByCategory = new Map(
    categories.map((row) => [
      row.category,
      row._sum.amount ?? 0,
    ])
  );

  // 3. Ghép ngân sách với số tiền đã chi.
  // Chỉ giữ những danh mục ngân sách hợp lệ.
  const budgetItems: DashboardBudgetItem[] =
    monthlyBudgets.flatMap((budget) => {
      if (!isBudgetCategory(budget.category)) {
        return [];
      }

      return [
        {
          category: budget.category,
          limitAmount: budget.limitAmount,

          spentAmount:
            budgetSpentByCategory.get(
              budget.category
            ) ?? 0,
        },
      ];
    });


  // Thu nhập và chi tiêu trong 6 tháng.
  const monthlyTrend = getMonthlyTrend(
    reportTransactions,
    now,
    6
  );

  // Phân bổ chi tiêu tháng hiện tại.
  const categoryExpenses = getCategoryExpenses(
    reportTransactions,
    now
  );


  return (
    <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
      {/* TIÊU ĐỀ DASHBOARD */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">
            Finance Planner · v1.0
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Tổng quan tài chính
          </h1>

          <p className="mt-2 text-muted-foreground">
            Xin chào {user.name}! Theo dõi tình hình
            thu chi và mục tiêu tiết kiệm của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <Link
            href="/reports"
            className="inline-flex items-center justify-center rounded-xl border border-brand/30 bg-card px-5 py-3 text-sm font-semibold text-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand motion-reduce:transform-none"
          >
            Xem báo cáo
          </Link>

          <Link
            href="/transactions"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand dark:text-background motion-reduce:transform-none"
          >
            + Quản lý giao dịch
          </Link>

        </div>
      </div>

      {/* THỐNG KÊ TÀI CHÍNH */}

      {/* =====================================
    V1.0 - THẺ THỐNG KÊ TÀI CHÍNH
===================================== */}
      <section
        aria-label="Tổng quan số dư"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {/* SỐ DƯ HIỆN TẠI */}
        <DashboardStatCard
          title="Số dư hiện tại"
          value={formatVND(balance)}
          description="Tổng thu trừ tổng chi"
          kind="balance"
          footer="Số dư được tính từ tất cả giao dịch đã ghi nhận."
        />

        {/* TỔNG THU NHẬP */}
        <DashboardStatCard
          title="Tổng thu nhập"
          value={formatVND(totalIncome)}
          description="Từ các giao dịch INCOME"
          kind="income"
          footer="Tổng thu nhập của tài khoản từ trước đến nay."
        />

        {/* TỔNG CHI TIÊU */}
        <DashboardStatCard
          title="Tổng chi tiêu"
          value={formatVND(totalExpense)}
          description="Từ các giao dịch EXPENSE"
          kind="expense"
          footer="Tổng chi tiêu của tài khoản từ trước đến nay."
        />
      </section>



      {/* ======================================
    V1.0 - BIỂU ĐỒ TÀI CHÍNH
====================================== */}
      <div className="mt-8 space-y-5">

        {/* HEADER BIỂU ĐỒ */}
        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Phân tích tài chính
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi xu hướng thu chi trong 6 tháng
              và phân bổ chi tiêu của tháng hiện tại.
            </p>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand"
          >
            Báo cáo chi tiết
            <span aria-hidden="true">→</span>
          </Link>

        </div>

        {/* BIỂU ĐỒ RECHARTS */}
        <FinanceCharts
          monthly={monthlyTrend}
          categories={categoryExpenses}
        />

      </div>


      {/* DANH MỤC VÀ WISHLIST */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* CHI TIÊU THEO DANH MỤC */}
        <section
          aria-labelledby="category-heading"
          className="rounded-2xl border border-line bg-card p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                id="category-heading"
                className="text-xl font-bold"
              >
                Chi tiêu theo danh mục
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Tháng hiện tại (giờ Việt Nam)
              </p>
            </div>

            <p className="font-bold tabular-nums">
              {formatVND(monthExpense)}
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Chưa có khoản chi trong tháng này.
            </p>
          ) : (
            <table className="mt-6 w-full text-sm">
              <caption className="sr-only">
                Số tiền chi tiêu theo từng danh mục
                trong tháng hiện tại
              </caption>

              <thead>
                <tr className="border-b border-line text-left text-muted-foreground">
                  <th
                    scope="col"
                    className="pb-3 font-medium"
                  >
                    Danh mục
                  </th>

                  <th
                    scope="col"
                    className="pb-3 text-right font-medium"
                  >
                    Số tiền
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.map((entry) => (
                  <tr
                    key={entry.category}
                    className="border-b border-line/60 last:border-0"
                  >
                    <th
                      scope="row"
                      className="py-3 text-left font-medium"
                    >
                      {CATEGORY_LABELS[entry.category]}
                    </th>

                    <td className="py-3 text-right tabular-nums">
                      {formatVND(entry._sum.amount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* WISHLIST */}
        <section
          aria-labelledby="wishlist-heading"
          className="rounded-2xl border border-line bg-card p-6"
        >

          {/* V1.0 - WISHLIST HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="wishlist-heading"
                className="text-xl font-bold text-foreground"
              >
                Mục tiêu tài chính
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Các mục tiêu gần đây của bạn
              </p>
            </div>

            <Link
              href="/wishlist"
              className="rounded-xl border border-line px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-muted"
            >
              Xem tất cả
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Tiến độ được tính từ số tiền đã dành riêng
            cho từng mục tiêu, không phụ thuộc vào số dư
            tài khoản hiện tại.
          </p>


          <div className="mt-6 space-y-6">

            {/* V1.0 - EMPTY STATE */}
            {wishes.length === 0 && (
              <div className="rounded-xl border border-dashed border-line bg-muted/30 p-6 text-center">
                <div
                  aria-hidden="true"
                  className="mb-3 text-3xl text-brand"
                >
                  ☆
                </div>

                <h3 className="font-semibold text-foreground">
                  Chưa có mục tiêu tài chính
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Hãy tạo mục tiêu đầu tiên để bắt đầu
                  lập kế hoạch tiết kiệm.
                </p>

                <Link
                  href="/wishlist"
                  className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  + Thêm mục tiêu
                </Link>
              </div>
            )}


            {wishes.map((item) => {

              // Tiến độ dựa trên tiền thực sự đã tiết kiệm.
              const progress =
                item.cost > 0
                  ? Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(
                        (item.savedAmount / item.cost) * 100
                      )
                    )
                  )
                  : 0;

              // Số tiền còn thiếu để đạt mục tiêu.
              const remaining = Math.max(
                0,
                item.cost - item.savedAmount
              );

              return (
                <div key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {PRIORITY_LABELS[item.priority]}
                        {" · "}
                        {formatVND(item.cost)}
                      </p>


                      {/* TIỀN ĐÃ TIẾT KIỆM */}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Đã tiết kiệm:{" "}
                        <span className="font-semibold text-foreground">
                          {formatVND(item.savedAmount)}
                        </span>
                      </p>

                      {/* SỐ TIỀN CÒN THIẾU */}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {remaining === 0 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Đã đạt mục tiêu
                          </span>
                        ) : (
                          <>
                            Còn thiếu: {formatVND(remaining)}
                          </>
                        )}
                      </p>

                    </div>

                    <strong className="text-sm tabular-nums text-brand">
                      {progress}%
                    </strong>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`Tiến độ tiết kiệm cho ${item.name}`}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>


      {/* =====================================
    V1.0 - TỔNG QUAN NGÂN SÁCH
===================================== */}
      <div className="mt-6">
        <DashboardBudgetOverview
          month={budgetMonthKey}
          items={budgetItems}
        />
      </div>


      {/* GIAO DỊCH GẦN ĐÂY */}
      <section
        aria-labelledby="recent-heading"
        className="mt-6 rounded-2xl border border-line bg-card p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="recent-heading"
            className="text-xl font-bold"
          >
            Giao dịch gần đây
          </h2>

          <Link
            href="/transactions"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Xem tất cả ({count})
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <caption className="sr-only">
              Sáu giao dịch gần đây
            </caption>

            <thead>
              <tr className="border-b border-line text-left text-muted-foreground">
                <th scope="col" className="pb-3 font-medium">
                  Nội dung
                </th>

                <th scope="col" className="pb-3 font-medium">
                  Danh mục
                </th>

                <th scope="col" className="pb-3 font-medium">
                  Ngày
                </th>

                <th
                  scope="col"
                  className="pb-3 text-right font-medium"
                >
                  Số tiền
                </th>
              </tr>
            </thead>

            <tbody>
              {recent.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-line/60 last:border-0"
                >
                  <th
                    scope="row"
                    className="py-4 text-left font-medium"
                  >
                    {entry.description}
                  </th>

                  <td className="py-4 text-muted-foreground">
                    {CATEGORY_LABELS[entry.category]}
                  </td>

                  <td className="py-4 tabular-nums text-muted-foreground">
                    {formatDate(entry.date)}
                  </td>

                  <td
                    className={`py-4 text-right font-semibold tabular-nums ${entry.type === "INCOME"
                      ? "text-brand"
                      : "text-foreground"
                      }`}
                  >
                    {entry.type === "INCOME" ? "+" : "−"}
                    {formatVND(entry.amount)}
                  </td>
                </tr>
              ))}

              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


    </main>
  );
}
