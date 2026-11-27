
import type { Metadata } from "next";
import Link from "next/link";

// ==========================================
// FINANCE PLANNER V1.0 - HOME PAGE
// ==========================================

export const metadata: Metadata = {
  title: "Finance Planner | Quản lý tài chính cá nhân",
  description:
    "Theo dõi thu chi, ngân sách, báo cáo và mục tiêu tiết kiệm với Finance Planner.",
};

// ==========================================
// 1. DANH SÁCH TÍNH NĂNG
// ==========================================

const FEATURES = [
  {
    number: "01",
    title: "Dashboard tài chính",
    description:
      "Tổng hợp số dư, thu nhập, chi tiêu, biểu đồ và tiến độ mục tiêu ngay tại một nơi.",
    tag: "Tổng quan",
  },
  {
    number: "02",
    title: "Quản lý giao dịch",
    description:
      "Thêm, sửa, xóa, tìm kiếm và lọc giao dịch. Hỗ trợ xuất dữ liệu CSV.",
    tag: "Thu & chi",
  },
  {
    number: "03",
    title: "Báo cáo trực quan",
    description:
      "Theo dõi xu hướng thu chi theo tháng và phân bổ chi tiêu theo danh mục.",
    tag: "Biểu đồ",
  },
  {
    number: "04",
    title: "Ngân sách thông minh",
    description:
      "Đặt hạn mức từng danh mục, theo dõi tiến độ và nhận cảnh báo khi sắp vượt ngân sách.",
    tag: "Kiểm soát",
  },
  {
    number: "05",
    title: "Mục tiêu tiết kiệm",
    description:
      "Tạo Wishlist, ghi nhận số tiền tiết kiệm và theo dõi các mốc hoàn thành.",
    tag: "Wishlist",
  },
  {
    number: "06",
    title: "Dữ liệu cá nhân",
    description:
      "Đăng nhập bằng Better Auth. Mỗi tài khoản quản lý giao dịch và mục tiêu riêng.",
    tag: "Bảo mật",
  },
] as const;

// ==========================================
// 2. CÁC GIAI ĐOẠN PHÁT TRIỂN
// ==========================================

const MILESTONES = [
  {
    code: "fp1",
    title: "Xây dựng nền tảng",
    description: "Next.js, Prisma, Neon và Dashboard",
  },
  {
    code: "fp2",
    title: "Quản lý giao dịch",
    description: "CRUD, Zod, bộ lọc và Vitest",
  },
  {
    code: "fp3",
    title: "Xác thực người dùng",
    description: "Better Auth và bảo vệ dữ liệu",
  },
  {
    code: "v1.0",
    title: "Mở rộng tính năng",
    description:
      "Wishlist, ngân sách, báo cáo và cải tiến UI",
  },
] as const;

// ==========================================
// 3. DỮ LIỆU MINH HỌA DASHBOARD
// ==========================================

// Dữ liệu giả lập cố định.
// Không truy cập Prisma hoặc tài khoản demo.
const PREVIEW_CHART = [
  { month: "T6", income: 62, expense: 35 },
  { month: "T7", income: 82, expense: 48 },
  { month: "T8", income: 68, expense: 42 },
  { month: "T9", income: 90, expense: 52 },
  { month: "T10", income: 76, expense: 45 },
  { month: "T11", income: 95, expense: 58 },
];

// ==========================================
// 4. COMPONENT XEM TRƯỚC DASHBOARD
// ==========================================

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line bg-card shadow-2xl shadow-black/10 dark:shadow-black/25">
      {/* Thanh tiêu đề */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>

        <p className="text-xs font-semibold text-muted-foreground">
          Dashboard Preview
        </p>

        <span className="rounded-lg bg-brand-soft px-2 py-1 text-[10px] font-semibold text-brand">
          DEMO
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Header */}
        <div>
          <p className="text-xs text-muted-foreground">
            Tổng quan tài chính
          </p>
          <h3 className="mt-1 text-xl font-bold text-foreground">
            Xin chào!
          </h3>
        </div>

        {/* Thẻ số dư */}
        <div className="rounded-2xl bg-gradient-to-br from-brand to-[#11536e] p-5 text-white dark:from-[#236b83] dark:to-[#12394c]">
          <p className="text-xs text-white/80">
            Số dư hiện tại
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
            24.580.000 đ
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
            <div>
              <p className="text-xs text-white/70">
                Tổng thu
              </p>
              <p className="mt-1 text-sm font-semibold">
                +30.900.000 đ
              </p>
            </div>

            <div>
              <p className="text-xs text-white/70">
                Tổng chi
              </p>
              <p className="mt-1 text-sm font-semibold">
                -6.320.000 đ
              </p>
            </div>
          </div>
        </div>

        {/* Biểu đồ minh họa */}
        <div className="rounded-2xl border border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-foreground">
              Xu hướng thu chi
            </h4>

            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-brand" />
                Thu
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-400" />
                Chi
              </span>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mt-6 grid h-32 grid-cols-6 items-end gap-3"
          >
            {PREVIEW_CHART.map((item) => (
              <div
                key={item.month}
                className="flex h-full items-end justify-center gap-1.5"
              >
                <div
                  className="w-3 rounded-t-md bg-brand/90 sm:w-4"
                  style={{
                    height: `${item.income}%`,
                  }}
                />
                <div
                  className="w-3 rounded-t-md bg-rose-400/80 sm:w-4"
                  style={{
                    height: `${item.expense}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-6 gap-3 text-center">
            {PREVIEW_CHART.map((item) => (
              <span
                key={item.month}
                className="text-[10px] text-muted-foreground"
              >
                {item.month}
              </span>
            ))}
          </div>
        </div>

        {/* Mục tiêu */}
        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">
              Mục tiêu tiết kiệm
            </h4>
            <span className="text-xs font-semibold text-brand">
              60%
            </span>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Mua laptop mới
          </p>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[60%] rounded-full bg-brand" />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            9.000.000 / 15.000.000 đ
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. TRANG CHỦ
// ==========================================

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* ====================================
          HERO
      ==================================== */}
      <section className="relative">
        {/* Hiệu ứng nền */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-brand/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-32 size-[380px] rounded-full bg-cyan-400/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Nội dung giới thiệu */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-xs font-semibold text-brand">
              <span className="size-2 rounded-full bg-brand" />
              Finance Planner v1.0
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Tài chính rõ ràng.
              <span className="mt-2 block text-brand">
                Mục tiêu trong tầm tay.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Quản lý thu chi, kiểm soát ngân sách
              và xây dựng kế hoạch tiết kiệm
              trên một nền tảng đơn giản,
              trực quan và dễ sử dụng.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/10 transition-all hover:-translate-y-0.5 hover:opacity-90 motion-reduce:transform-none dark:text-background"
              >
                Bắt đầu miễn phí
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-xl border border-brand/30 bg-brand/10 px-6 py-3.5 text-sm font-bold text-brand transition-colors hover:bg-brand/15"
              >
                Dùng thử không cần đăng nhập
              </Link>


              <a
                href="#preview"
                className="inline-flex items-center justify-center rounded-xl border border-line bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Xem trước giao diện
              </a>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-xs text-muted-foreground">
              <span>✓ Theo dõi thu chi</span>
              <span>✓ Lập ngân sách</span>
              <span>✓ Tiết kiệm theo mục tiêu</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div id="preview" className="scroll-mt-24">
            <DashboardPreview />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Hình xem trước sử dụng dữ liệu mô phỏng,
              không phải thông tin tài khoản thật.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================
          FEATURES
      ==================================== */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="border-y border-line bg-card/40 py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Công cụ tài chính
            </span>

            <h2
              id="features-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Mọi thứ bạn cần để quản lý tài chính
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              Từ ghi chép giao dịch hằng ngày
              đến theo dõi ngân sách và các mục tiêu
              dài hạn.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg motion-reduce:transform-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                    {feature.number}
                  </span>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================
          DEVELOPMENT MILESTONES
      ==================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Quá trình phát triển
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Từng bước xây dựng một công cụ hữu ích
            </h2>

            <p className="mt-5 leading-7 text-muted-foreground">
              Finance Planner được phát triển
              qua các giai đoạn, từ nền tảng dữ liệu,
              quản lý giao dịch và xác thực,
              đến các công cụ quản lý ngân sách
              và tiết kiệm.
            </p>
          </div>

          <div className="space-y-3">
            {MILESTONES.map((item) => (
              <div
                key={item.code}
                className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5"
              >
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                  {item.code}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <span className="hidden shrink-0 text-xs font-semibold text-brand sm:inline">
                  Đã triển khai
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================
          GUEST PREVIEW INTRO
      ==================================== */}
      <section className="border-y border-line bg-brand-soft/60 py-16">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Khám phá Finance Planner
          </span>

          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Xem trước trước khi bắt đầu
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
            Trải nghiệm Dashboard, thử thêm và lọc giao dịch,
            điều chỉnh ngân sách, tạo mục tiêu tiết kiệm
            mà không cần đăng nhập. Toàn bộ dữ liệu
            đều được mô phỏng và không ảnh hưởng
            đến tài khoản thật.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#preview"
              className="rounded-xl border border-line bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Xem Dashboard mẫu
            </a>

            <Link
              href="/demo"
              className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-background"
            >
              Trải nghiệm ngay
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-background"
            >
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================
          FINAL CTA
      ==================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#166482] to-[#103e56] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-white/15"
          />

          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Bắt đầu quản lý tài chính hôm nay
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-white/80">
              Ghi lại giao dịch, hiểu rõ thói quen
              chi tiêu và tiến gần hơn đến
              những mục tiêu tiết kiệm.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#103e56] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              Tạo tài khoản miễn phí
            </Link>

            <p className="mt-5 text-xs text-white/65">
              Finance Planner · PHY10615 · v1.0
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
