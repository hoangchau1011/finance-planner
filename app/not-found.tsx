import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-sm font-bold text-brand">404 · Không tìm thấy trang</p>
      <h1 className="mt-4 text-3xl font-bold">Trang này chưa được mở công khai</h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        Dashboard fp1 chỉ có thể xem trên máy local. Hãy chạy npm run dev với FP1_LOCAL_PREVIEW=true.
        Đăng nhập thật sẽ được triển khai ở fp3.
      </p>
      <Link className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 font-semibold text-white dark:text-background" href="/">Về trang chủ</Link>
    </main>
  );
}
