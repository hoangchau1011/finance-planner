
// ==========================================
// FINANCE PLANNER V1.0
// DASHBOARD LOADING SKELETON
// ==========================================

// Component khung chờ dữ liệu.
function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted motion-reduce:animate-none ${className}`}
    />
  );
}

// Thẻ thống kê đang tải.
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-3/4" />
      <Skeleton className="mt-4 h-3 w-1/2" />
    </div>
  );
}

// Khung biểu đồ đang tải.
function ChartSkeleton({
  titleWidth = "w-40",
}: {
  titleWidth?: string;
}) {
  const heights = [
    "h-[45%]",
    "h-[70%]",
    "h-[55%]",
    "h-[90%]",
    "h-[65%]",
    "h-[80%]",
  ];

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <Skeleton
        className={`h-5 ${titleWidth}`}
      />

      <Skeleton className="mt-3 h-3 w-48 max-w-full" />

      <div className="mt-8 flex h-52 items-end gap-3 border-b border-line pb-2">
        {heights.map((height, index) => (
          <Skeleton
            key={index}
            className={`flex-1 rounded-b-none ${height}`}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-between gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-3 w-8"
          />
        ))}
      </div>
    </div>
  );
}

// Khung tiến độ ngân sách / Wishlist.
function ProgressSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-12" />
      </div>

      <Skeleton className="h-3 w-full rounded-full" />

      <Skeleton className="h-3 w-40 max-w-full" />
    </div>
  );
}

// ==========================================
// NEXT.JS LOADING STATE
// ==========================================

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8 sm:py-12"
    >
      <p
        role="status"
        className="sr-only"
      >
        Đang tải dữ liệu Dashboard...
      </p>

      <div aria-hidden="true" className="space-y-8">

        {/* HEADER DASHBOARD */}
        <header className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </header>

        {/* THẺ THỐNG KÊ */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </section>

        {/* BIỂU ĐỒ TÀI CHÍNH */}
        <section className="grid gap-5 lg:grid-cols-2">
          <ChartSkeleton titleWidth="w-44" />
          <ChartSkeleton titleWidth="w-36" />
        </section>

        {/* WISHLIST VÀ CHI TIÊU */}
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <Skeleton className="h-6 w-44" />

            <div className="mt-7 space-y-6">
              {Array.from({ length: 3 }, (_, index) => (
                <ProgressSkeleton key={index} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <Skeleton className="h-6 w-48" />

            <div className="mt-7 space-y-6">
              {Array.from({ length: 3 }, (_, index) => (
                <ProgressSkeleton key={index} />
              ))}
            </div>
          </div>
        </section>

        {/* TỔNG QUAN NGÂN SÁCH */}
        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-36" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>

          <div className="mt-7 space-y-6">
            {Array.from({ length: 3 }, (_, index) => (
              <ProgressSkeleton key={index} />
            ))}
          </div>
        </section>

        {/* GIAO DỊCH GẦN ĐÂY */}
        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <Skeleton className="h-6 w-48" />

          <div className="mt-6 divide-y divide-line">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>

                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
