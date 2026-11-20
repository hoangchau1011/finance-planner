import Link from 'next/link';

const FEATURES = [
  { title: 'Tổng quan thu chi', detail: 'Tính số dư từ giao dịch lưu trong PostgreSQL trên Neon.' },
  { title: 'Danh mục trực quan', detail: 'Xem bảng tổng hợp chi tiêu của tháng hiện tại.' },
  { title: 'Wishlist mẫu', detail: 'Theo dõi phần trăm tiến độ đối với từng mục tiêu.' },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex rounded-full border border-line bg-brand-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
            Đồ án PHY10615 · milestone fp1
          </span>
          <h1 className="mt-6 max-w-xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            Quản lý tài chính với <span className="text-brand">bức tranh rõ ràng.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Finance Planner giúp theo dõi tổng thu, tổng chi và tiến độ mục tiêu. Ở fp1, ứng dụng
            mới chỉ có dữ liệu demo để kiểm tra kết nối Neon và giao diện dashboard đọc dữ liệu.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-background">
              Mở dashboard local
            </Link>
            <span className="text-sm text-muted-foreground">Chưa hỗ trợ đăng nhập cho tới fp3</span>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-card p-7 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Tiến độ phát triển</p>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold">fp1 / v1.0</span>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ['01', 'PostgreSQL / Neon', 'Schema và migration'],
              ['02', 'Seed', '42 giao dịch trong 4 tháng'],
              ['03', 'Dashboard', 'Trang đọc dữ liệu'],
            ].map(([number, title, detail]) => (
              <div key={number} className="flex items-center gap-4 rounded-2xl bg-muted p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card font-bold text-brand">{number}</span>
                <div><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{detail}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            Lưu ý bảo mật: /dashboard chỉ hoạt động ở máy local khi chạy chế độ development.
            Bản production không công khai dữ liệu demo trước khi có Better Auth.
          </p>
        </div>
      </section>
      <section className="mt-20 grid gap-5 md:grid-cols-3" aria-label="Chức năng fp1">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-lg font-bold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
