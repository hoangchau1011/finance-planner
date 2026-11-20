export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12" role="status" aria-live="polite">
      <h1 className="text-2xl font-bold">Đang tải dashboard…</h1>
      <p className="mt-3 text-muted-foreground">Đang đọc dữ liệu mẫu từ Neon PostgreSQL.</p>
    </main>
  );
}
