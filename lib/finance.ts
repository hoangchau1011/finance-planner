const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatVND(amount: number): string {
  return vnd.format(amount);
}

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export type DateRangeFilter = 'this-month' | 'last-month' | 'all';

// Retained from the week-9 sample for its original unit tests.
export function getDateRange(range: DateRangeFilter, now = new Date()) {
  if (range === 'all') return undefined;
  const back = range === 'last-month' ? 1 : 0;
  const year = now.getFullYear();
  const month = now.getMonth() - back;
  return {
    gte: new Date(year, month, 1),
    lt: new Date(year, month + 1, 1),
  };
}

// Finance Planner month boundaries are always in Vietnam time (UTC+07:00),
// even if Vercel/Neon run on servers with a different timezone.
export function getVietnamMonthRange(now = new Date(), monthOffset = 0) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const utcPlus7Ms = 7 * 60 * 60 * 1000;
  return {
    gte: new Date(Date.UTC(year, month - 1 + monthOffset, 1) - utcPlus7Ms),
    lt: new Date(Date.UTC(year, month + monthOffset, 1) - utcPlus7Ms),
  };
}

export function wishlistProgress(balance: number, cost: number): number {
  if (!Number.isFinite(balance) || !Number.isFinite(cost) || cost <= 0) return 0;
  const percent = Math.floor((balance / cost) * 100);
  return Math.min(100, Math.max(0, percent));
}

export const MILESTONES = [50, 75, 100] as const;

export function crossedMilestones(previous: number, next: number): number[] {
  return MILESTONES.filter((milestone) => previous < milestone && next >= milestone);
}

export const CATEGORY_LABELS = {
  FOOD: 'Ăn uống',
  TRANSPORT: 'Di chuyển',
  ENTERTAINMENT: 'Giải trí',
  SHOPPING: 'Mua sắm',
  BILLS: 'Hóa đơn',
  SALARY: 'Lương',
  INVESTMENT: 'Đầu tư',
  OTHER: 'Khác',
} as const;
