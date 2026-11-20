import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  CATEGORY_LABELS,
  formatVND,
  getVietnamMonthRange,
  wishlistProgress,
} from '@/lib/finance';

export const dynamic = 'force-dynamic';

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).format(value);
}

const PRIORITY_LABELS = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao' } as const;

export default async function DashboardPage() {
  // fp1 has no auth yet. Local-only preview; never expose a shared demo account
  // on a public deployment. fp3 replaces this with requireUser() + real session.
  if (process.env.NODE_ENV !== 'development' || process.env.FP1_LOCAL_PREVIEW !== 'true') {
    notFound();
  }

  const host = (await headers()).get('host') ?? '';
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    notFound();
  }

  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { email: 'demo@phy10615.vn' },
    select: { id: true, name: true },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-20">
        <h1 className="text-3xl font-bold">Chưa có dữ liệu mẫu</h1>
        <p className="mt-4 text-muted-foreground">
          Chạy npx prisma migrate dev, npx prisma generate và npx prisma db seed trước khi mở lại trang này.
        </p>
      </main>
    );
  }

  const userId = user.id;
  const currentMonth = getVietnamMonthRange();
  const [income, expense, categories, recent, wishes, count] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { userId, type: 'INCOME' } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { userId, type: 'EXPENSE' } }),
    prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: { userId, type: 'EXPENSE', date: currentMonth },
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.transaction.findMany({ where: { userId }, orderBy: [{ date: 'desc' }, { id: 'desc' }], take: 6 }),
    prisma.wishlistItem.findMany({ where: { userId }, orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }] }),
    prisma.transaction.count({ where: { userId } }),
  ]);
  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;
  const balance = totalIncome - totalExpense;
  const monthExpense = categories.reduce((sum, row) => sum + (row._sum.amount ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">Tài khoản mẫu · Chỉ xem trên máy local</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tổng quan tài chính</h1>
          <p className="mt-2 text-muted-foreground">Xin chào {user.name}. Dữ liệu mẫu được đọc từ Neon PostgreSQL.</p>
        </div>
        <span className="rounded-full border border-line bg-card px-4 py-2 text-sm text-muted-foreground">{count} giao dịch đã lưu</span>
      </div>

      <section aria-label="Tổng quan số dư" className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-brand bg-brand p-6 text-white shadow-lg shadow-black/5 dark:text-background">
          <p className="text-sm font-medium opacity-85">Số dư hiện tại</p>
          <p className="mt-4 break-words text-3xl font-bold tabular-nums">{formatVND(balance)}</p>
          <p className="mt-3 text-xs opacity-85">Tất cả giao dịch đến hiện tại</p>
        </article>
        <article className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Tổng thu</p>
          <p className="mt-4 break-words text-2xl font-bold tabular-nums">{formatVND(totalIncome)}</p>
          <p className="mt-3 text-xs text-muted-foreground">Từ giao dịch INCOME</p>
        </article>
        <article className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Tổng chi</p>
          <p className="mt-4 break-words text-2xl font-bold tabular-nums">{formatVND(totalExpense)}</p>
          <p className="mt-3 text-xs text-muted-foreground">Từ giao dịch EXPENSE</p>
        </article>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-card p-6" aria-labelledby="category-heading">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="category-heading" className="text-xl font-bold">Chi tiêu theo danh mục</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tháng hiện tại (giờ Việt Nam)</p>
            </div>
            <p className="font-bold tabular-nums">{formatVND(monthExpense)}</p>
          </div>
          {categories.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Chưa có khoản chi trong tháng.</p>
          ) : (
            <table className="mt-6 w-full text-sm">
              <caption className="sr-only">Số tiền chi tiêu theo danh mục trong tháng này</caption>
              <thead><tr className="border-b border-line text-left text-muted-foreground"><th scope="col" className="pb-3 font-medium">Danh mục</th><th scope="col" className="pb-3 text-right font-medium">Số tiền</th></tr></thead>
              <tbody>
                {categories.map((entry) => (
                  <tr key={entry.category} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="py-3 text-left font-medium">{CATEGORY_LABELS[entry.category]}</th>
                    <td className="py-3 text-right tabular-nums">{formatVND(entry._sum.amount ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-6" aria-labelledby="wishlist-heading">
          <h2 id="wishlist-heading" className="text-xl font-bold">Wishlist mẫu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tiến độ tính từ số dư hiện tại</p>
          <div className="mt-6 space-y-6">
            {wishes.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có wishlist.</p> : null}
            {wishes.map((item) => {
              const progress = wishlistProgress(balance, item.cost);
              return (
                <div key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-muted-foreground">{PRIORITY_LABELS[item.priority]} · {formatVND(item.cost)}</p></div>
                    <strong className="text-sm tabular-nums text-brand">{progress}%</strong>
                  </div>
                  <div role="progressbar" aria-label={`Tiến độ tiết kiệm cho ${item.name}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6" aria-labelledby="recent-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="recent-heading" className="text-xl font-bold">Giao dịch gần đây</h2>
          <span className="text-sm text-muted-foreground">6 giao dịch gần nhất · Chỉ đọc ở fp1</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <caption className="sr-only">Danh sách các giao dịch gần đây của tài khoản mẫu</caption>
            <thead><tr className="border-b border-line text-left text-muted-foreground"><th className="pb-3 font-medium" scope="col">Nội dung</th><th className="pb-3 font-medium" scope="col">Danh mục</th><th className="pb-3 font-medium" scope="col">Ngày</th><th className="pb-3 text-right font-medium" scope="col">Số tiền</th></tr></thead>
            <tbody>
              {recent.map((entry) => (
                <tr key={entry.id} className="border-b border-line/60 last:border-0">
                  <th className="py-4 text-left font-medium" scope="row">{entry.description}</th>
                  <td className="py-4 text-muted-foreground">{CATEGORY_LABELS[entry.category]}</td>
                  <td className="py-4 tabular-nums text-muted-foreground">{formatDate(entry.date)}</td>
                  <td className={`py-4 text-right font-semibold tabular-nums ${entry.type === 'INCOME' ? 'text-brand' : ''}`}>{entry.type === 'INCOME' ? '+' : '−'}{formatVND(entry.amount)}</td>
                </tr>
              ))}
              {recent.length === 0 ? <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Chưa có giao dịch.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
      <p className="mt-6 text-sm text-muted-foreground">fp2: CRUD và lọc URL · fp3: Better Auth và phân quyền · v1.0: biểu đồ, ngân sách, CSV, thông báo.</p>
    </main>
  );
}
