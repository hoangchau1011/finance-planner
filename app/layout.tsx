
import { AuthNav } from "@/components/auth-nav";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteNavigation } from "@/components/site-navigation";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Finance Planner | Quản lý thu chi",
  description:
    "Dự án Finance Planner PHY10615: theo dõi thu chi và mục tiêu tiết kiệm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {/* HEADER */}

          {/* =====================================
    V1.0 - RESPONSIVE HEADER
===================================== */}
          <header className="site-header sticky top-0 z-20 border-b border-line bg-card/95 text-foreground backdrop-blur">
            <nav
              aria-label="Điều hướng chính"
              className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-8"
            >
              {/* LOGO */}
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-xl bg-brand text-white dark:text-background"
                >
                  ₫
                </span>

                <span className="hidden min-[400px]:inline">
                  Finance Planner
                </span>
              </Link>

              {/* ĐIỀU HƯỚNG VÀ TÀI KHOẢN */}
              <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 text-sm">
                <SiteNavigation />

                {/* GIỮ NGUYÊN BETTER AUTH */}
                <AuthNav />

                {/* GIỮ NGUYÊN LIGHT / DARK MODE */}
                <ThemeToggle />
              </div>
            </nav>
          </header>

          {/* THÔNG BÁO SONNER */}
          <Toaster
            position="top-right"
            richColors
            closeButton
          />

          {/* NỘI DUNG TRANG */}
          {children}

          {/* V1.0 - FOOTER ĐỒNG BỘ TOÀN WEBSITE */}
          <SiteFooter />

        </ThemeProvider>
      </body>
    </html>
  );
}
