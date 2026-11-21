
import Link from "next/link";
import { notFound } from "next/navigation";

import { UnauthorizedError, requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import {
  CATEGORY_LABELS,
  formatVND,
  getVietnamMonthRange,
  wishlistProgress,
} from "@/lib/finance";

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

export default async function DashboardPage() {
  // fp2: Chỉ cho phép truy cập tài khoản demo trên localhost.
  // fp3: Thay thế bằng Better Auth.
  let user: Awaited<ReturnType<typeof requireUser>>;

  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      notFound();
    }

    throw error;
  }

  const userId = user.id;
  const currentMonth = getVietnamMonthRange();

  // Truy vấn dữ liệu theo đúng userId
  const [
    income,
    expense,
    categories,
    recent,
    wishes,
    count,
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
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    }),

    prisma.transaction.count({
      where: { userId },
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

  return (
    <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
      {/* TIÊU ĐỀ DASHBOARD */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">
            Finance Planner · fp2
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Tổng quan tài chính
          </h1>

          <p className="mt-2 text-muted-foreground">
            Xin chào {user.name}! Theo dõi tình hình
            thu chi và mục tiêu tiết kiệm của bạn.
          </p>
        </div>

        <Link
          href="/transactions"
          className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:text-background"
        >
          Quản lý giao dịch
        </Link>
      </div>

      {/* THỐNG KÊ TÀI CHÍNH */}
      <section
        aria-label="Tổng quan số dư"
        className="mt-8 grid gap-4 md:grid-cols-3"
      >
        <article className="rounded-2xl border border-brand bg-brand p-6 text-white shadow-lg shadow-black/5 dark:text-background">
          <p className="text-sm font-medium opacity-85">
            Số dư hiện tại
          </p>

          <p className="mt-4 break-words text-3xl font-bold tabular-nums">
            {formatVND(balance)}
          </p>

          <p className="mt-3 text-xs opacity-85">
            Tổng thu − Tổng chi
          </p>
        </article>

        <article className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Tổng thu nhập
          </p>

          <p className="mt-4 break-words text-2xl font-bold tabular-nums">
            {formatVND(totalIncome)}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            Từ giao dịch INCOME
          </p>
        </article>

        <article className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Tổng chi tiêu
          </p>

          <p className="mt-4 break-words text-2xl font-bold tabular-nums">
            {formatVND(totalExpense)}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            Từ giao dịch EXPENSE
          </p>
        </article>
      </section>

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
          <h2
            id="wishlist-heading"
            className="text-xl font-bold"
          >
            Wishlist
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Tiến độ tiết kiệm dựa trên số dư hiện tại
          </p>

          <div className="mt-6 space-y-6">
            {wishes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chưa có món đồ mong muốn.
              </p>
            )}

            {wishes.map((item) => {
              const progress = wishlistProgress(
                balance,
                item.cost,
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

      <p className="mt-6 text-sm text-muted-foreground">
        Bản demo fp2 chỉ hoạt động trên localhost.
        Xác thực Better Auth sẽ được bổ sung trong fp3.
      </p>
    </main>
  );
}
