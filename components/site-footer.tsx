"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";


// ==========================================
// FINANCE PLANNER V1.0 - SITE FOOTER
// ==========================================

const featureLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Giao dịch" },
    { href: "/reports", label: "Báo cáo tài chính" },
    { href: "/budgets", label: "Quản lý ngân sách" },
    { href: "/wishlist", label: "Mục tiêu tiết kiệm" },
    { href: "/simulator", label: "Mô phỏng tài chính" },
] as const;


const exploreLinks = [
    { href: "/demo", label: "Dùng thử miễn phí" },
    { href: "/register", label: "Tạo tài khoản" },
    { href: "/login", label: "Đăng nhập" },
] as const;

// ==========================================
// FOOTER COMPONENT
// ==========================================


export function SiteFooter() {
    // Kiểm tra session Better Auth.
    const {
        data: session,
        isPending,
    } = authClient.useSession();

    // Chỉ hiển thị mục Khám phá
    // khi đã xác định người dùng chưa đăng nhập.
    const showGuestExplore =
        !isPending && !session;

    return (

        <footer className="border-t border-line bg-card/60">
            <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
                <div
                    className={`grid gap-10 sm:grid-cols-2 ${showGuestExplore
                        ? "lg:grid-cols-3"
                        : "lg:grid-cols-2"
                        }`}>

                    {/* GIỚI THIỆU */}
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <span className="grid size-10 place-items-center rounded-xl bg-brand text-lg font-bold text-white dark:text-background">
                                ₫
                            </span>

                            <span className="text-lg font-bold text-foreground">
                                Finance Planner
                            </span>
                        </Link>

                        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                            Ứng dụng quản lý tài chính cá nhân,
                            giúp theo dõi thu chi, lập ngân sách
                            và quản lý mục tiêu tiết kiệm
                            một cách trực quan.
                        </p>

                        <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                            Finance Planner · v1.0
                        </span>
                    </div>

                    {/* TÍNH NĂNG */}
                    <nav
                        aria-label="Liên kết tính năng"
                        className="space-y-4"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                            Tính năng
                        </h2>

                        <ul className="space-y-3">
                            {featureLinks.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>


                    {/* KHÁM PHÁ - CHỈ HIỂN THỊ KHI CHƯA ĐĂNG NHẬP */}
                    {showGuestExplore && (
                        <nav
                            aria-label="Khám phá ứng dụng"
                            className="space-y-4"
                        >
                            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                Khám phá
                            </h2>

                            <ul className="space-y-3">
                                {exploreLinks.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-brand"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="rounded-xl border border-line bg-muted/30 p-4">
                                <p className="text-sm font-semibold text-foreground">
                                    Trải nghiệm không cần đăng nhập
                                </p>

                                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                                    Guest Demo sử dụng dữ liệu mô phỏng độc lập,
                                    không thay đổi dữ liệu tài khoản thực.
                                </p>

                                <Link
                                    href="/demo"
                                    className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline"
                                >
                                    Khám phá Guest Demo →
                                </Link>
                            </div>
                        </nav>
                    )}

                </div>

                {/* DÒNG CUỐI */}
                <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Finance Planner · PHY10615 · v1.0
                    </p>

                    <p>
                        Next.js · TypeScript · Prisma · Neon
                    </p>
                </div>
            </div>
        </footer>
    );
}
