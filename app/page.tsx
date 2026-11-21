
import Link from "next/link";

const FEATURES = [
  {
    title: "Quản lý thu chi",
    detail:
      "Thêm, xem, sửa và xóa giao dịch. Dữ liệu được lưu trên PostgreSQL Neon.",
  },
  {
    title: "Lọc giao dịch thông minh",
    detail:
      "Lọc theo tháng, loại thu chi và danh mục. Bộ lọc được lưu trên URL.",
  },
  {
    title: "Dashboard tài chính",
    detail:
      "Theo dõi số dư, tổng thu nhập, tổng chi tiêu và tiến độ Wishlist.",
  },
];

const MILESTONES = [
  {
    number: "01",
    title: "fp1 — Nền tảng",
    detail: "Prisma 7, Neon, seed và Dashboard",
    completed: true,
  },
  {
    number: "02",
    title: "fp2 — Quản lý giao dịch",
    detail: "CRUD, Zod 4, URL Filters và Vitest",
    completed: true,
  },
  {
    number: "03",
    title: "fp3 — Xác thực",
    detail: "Better Auth và phân quyền theo userId",
    completed: false,
  },
  {
    number: "04",
    title: "v1.0 — Hoàn thiện",
    detail: "Wishlist, biểu đồ và tính năng mở rộng",
    completed: false,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      {/* GIỚI THIỆU */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex rounded-full border border-line bg-brand-soft px-4 py-2 text-xs font-semibold uppercase tracking-widest">
            Đồ án PHY10615 · Milestone fp2
          </span>

          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Quản lý tài chính
            <span className="text-brand">
              {" "}thông minh hơn.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Finance Planner giúp bạn quản lý thu nhập,
            chi tiêu và mục tiêu tiết kiệm.
            Theo dõi tình hình tài chính cá nhân
            một cách trực quan, đơn giản và hiệu quả.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 dark:text-background"
            >
              Xem Dashboard
            </Link>

            <Link
              href="/transactions"
              className="rounded-xl border border-line bg-card px-6 py-3 font-semibold transition hover:bg-muted"
            >
              Quản lý giao dịch
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Phiên bản fp2 · Chỉ hỗ trợ dữ liệu demo trên localhost.
            Đăng nhập sẽ được bổ sung ở fp3.
          </p>
        </div>

        {/* TIẾN ĐỘ PHÁT TRIỂN */}
        <div className="rounded-3xl border border-line bg-card p-7 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              Lộ trình phát triển
            </h2>

            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold">
              fp2 / v1.0
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {MILESTONES.map((item) => (
              <div
                key={item.number}
                className="flex items-center gap-4 rounded-2xl bg-muted p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card font-bold text-brand">
                  {item.number}
                </span>

                <div className="flex-1">
                  <p className="font-semibold">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>

                <span
                  className={
                    item.completed
                      ? "text-xs font-semibold text-brand"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {item.completed
                    ? "Đã phát triển"
                    : "Sắp tới"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHỨC NĂNG */}
      <section
        aria-labelledby="features-heading"
        className="mt-20"
      >
        <div className="mb-7">
          <h2
            id="features-heading"
            className="text-2xl font-bold"
          >
            Tính năng Finance Planner
          </h2>

          <p className="mt-2 text-muted-foreground">
            Những công cụ giúp quản lý tài chính cá nhân.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-line bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="text-lg font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {feature.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
