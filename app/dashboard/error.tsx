'use client';

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-2xl font-bold">Không tải được dữ liệu dashboard</h1>
      <p className="mt-3 leading-7 text-muted-foreground">Hãy kiểm tra kết nối Neon trong .env, migration và dữ liệu seed trên máy local. Thông tin kết nối không được hiển thị trên giao diện.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-xl bg-brand px-5 py-3 font-semibold text-white dark:text-background">Thử lại</button>
    </main>
  );
}
