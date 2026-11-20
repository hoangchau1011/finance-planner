import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finance Planner | Quản lý thu chi',
  description: 'Dự án Finance Planner PHY10615: theo dõi thu chi và mục tiêu tiết kiệm.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
            <nav aria-label="Điều hướng chính" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
              <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground">
                <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-brand text-white dark:text-background">₫</span>
                Finance Planner
              </Link>
              <div className="flex items-center gap-3 text-sm">
                <Link className="rounded-lg px-2 py-2 font-medium hover:text-brand focus-visible:outline-2 focus-visible:outline-brand" href="/dashboard">Dashboard fp1</Link>
                <ThemeToggle />
              </div>
            </nav>
          </header>
          {children}
          <footer className="border-t border-line py-7 text-center text-sm text-muted-foreground">
            Finance Planner · PHY10615 · fp1 — bản xem dữ liệu local
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
