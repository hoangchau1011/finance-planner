
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
      {/* Mã lỗi */}
      <p className="text-sm font-semibold tracking-widest text-brand">
        404 · KHÔNG TÌM THẤY TRANG
      </p>

      {/* Tiêu đề */}
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Trang bạn tìm kiếm không tồn tại
      </h1>

      {/* Mô tả */}
      <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
        Đường dẫn có thể đã được thay đổi hoặc không còn tồn tại.
        Vui lòng kiểm tra lại địa chỉ hoặc quay về trang chủ
        Finance Planner.
      </p>

      {/* Điều hướng */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:opacity-90"
        >
          Về trang chủ
        </Link>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-muted"
        >
          Đến Dashboard
        </Link>
      </div>
    </main>
  );
}
