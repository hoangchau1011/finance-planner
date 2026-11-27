
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ==========================================
// FINANCE PLANNER V1.0
// RESPONSIVE SITE NAVIGATION
// ==========================================


const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Giao dịch" },
    { href: "/reports", label: "Báo cáo" },
    { href: "/budgets", label: "Ngân sách" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/simulator", label: "Mô phỏng" },
] as const;


// ==========================================
// 1. KIỂM TRA TRANG ĐANG TRUY CẬP
// ==========================================

function isActiveRoute(
    pathname: string,
    href: string
) {
    return (
        pathname === href ||
        pathname.startsWith(`${href}/`)
    );
}

// ==========================================
// 2. COMPONENT ĐIỀU HƯỚNG
// ==========================================

export function SiteNavigation() {
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] =
        useState(false);

    return (
        <>
            {/* ===============================
          MENU DESKTOP
      =============================== */}
            <div className="hidden items-center gap-1 xl:flex">
                {navigationItems.map((item) => {
                    const active = isActiveRoute(
                        pathname,
                        item.href
                    );

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={
                                active ? "page" : undefined
                            }
                            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${active
                                ? "bg-brand/10 text-brand"
                                : "text-foreground hover:bg-muted hover:text-brand"
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            {/* ===============================
          NÚT MỞ MENU MOBILE / TABLET
      =============================== */}
            <button
                type="button"
                aria-label={
                    isMenuOpen
                        ? "Đóng menu điều hướng"
                        : "Mở menu điều hướng"
                }
                aria-expanded={isMenuOpen}
                aria-controls={
                    isMenuOpen
                        ? "site-mobile-navigation"
                        : undefined
                }
                onClick={() =>
                    setIsMenuOpen((previous) => !previous)
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-brand xl:hidden"
            >
                {isMenuOpen ? (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-5 w-5"
                    >
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-5 w-5"
                    >
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                )}

                <span className="hidden sm:inline">
                    Menu
                </span>
            </button>

            {/* ===============================
          MENU DROPDOWN MOBILE / TABLET
      =============================== */}
            {isMenuOpen && (
                <div
                    id="site-mobile-navigation"
                    className="absolute inset-x-0 top-full z-30 border-b border-line bg-card px-5 py-4 shadow-lg xl:hidden"
                >
                    <div className="mx-auto grid max-w-6xl gap-1">
                        {navigationItems.map((item) => {
                            const active = isActiveRoute(
                                pathname,
                                item.href
                            );

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={
                                        active ? "page" : undefined
                                    }
                                    onClick={() =>
                                        setIsMenuOpen(false)
                                    }
                                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${active
                                        ? "bg-brand/10 text-brand"
                                        : "text-foreground hover:bg-muted"
                                        }`}
                                >
                                    <span>{item.label}</span>

                                    {active && (
                                        <span
                                            aria-hidden="true"
                                            className="text-brand"
                                        >
                                            ✓
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
