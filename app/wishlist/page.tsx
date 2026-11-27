
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser, UnauthorizedError } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import { WishlistForm } from "./wishlist-form";
import { WishlistTable } from "./wishlist-table";

// ==========================================
// V1.0 - WISHLIST PAGE
// ==========================================

export const metadata: Metadata = {
    title: "Wishlist | Finance Planner",
    description: "Quản lý các mục tiêu tài chính cá nhân.",
};

// Luôn kiểm tra session khi truy cập.
export const dynamic = "force-dynamic";

// Định dạng tiền VND, không phụ thuộc locale.
function formatVND(value: number): string {
    const formatted = String(value).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "."
    );

    return `${formatted} đ`;
}

export default async function WishlistPage() {
    // ========================================
    // 1. XÁC THỰC BETTER AUTH
    // ========================================

    let user: Awaited<ReturnType<typeof requireUser>>;

    try {
        user = await requireUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            redirect("/login");
        }

        throw error;
    }

    // ========================================
    // 2. LẤY WISHLIST CỦA USER HIỆN TẠI
    // ========================================

    const wishlistItems = await prisma.wishlistItem.findMany({
        where: {
            userId: user.id,
        },

        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],

        select: {
            id: true,
            name: true,
            cost: true,
            savedAmount: true,
            priority: true,
        },
    });

    // ========================================
    // 3. TÍNH THỐNG KÊ
    // ========================================

    const totalItems = wishlistItems.length;

    const totalCost = wishlistItems.reduce(
        (sum, item) => sum + item.cost,
        0
    );

    const highPriorityItems = wishlistItems.filter(
        (item) => item.priority === "HIGH"
    ).length;

    // ========================================
    // 4. GIAO DIỆN WISHLIST
    // ========================================

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">

            {/* TIÊU ĐỀ TRANG */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-brand">
                        Finance Planner · v1.0
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        Mục tiêu tài chính
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Xin chào {user.name}! Lập kế hoạch cho
                        những mục tiêu bạn muốn đạt được.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-muted"
                >
                    Về Dashboard
                </Link>
            </div>

            {/* THẺ THỐNG KÊ */}
            <section
                aria-label="Tổng quan Wishlist"
                className="grid gap-4 sm:grid-cols-3"
            >
                {/* TỔNG SỐ MỤC TIÊU */}
                <div className="rounded-2xl border border-line bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Tổng số mục tiêu
                    </p>

                    <p className="mt-2 text-3xl font-bold text-foreground">
                        {totalItems}
                    </p>
                </div>

                {/* TỔNG CHI PHÍ */}
                <div className="rounded-2xl border border-line bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Tổng chi phí mục tiêu
                    </p>

                    <p className="mt-2 text-2xl font-bold text-brand">
                        {formatVND(totalCost)}
                    </p>
                </div>

                {/* MỤC TIÊU ƯU TIÊN CAO */}
                <div className="rounded-2xl border border-line bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Ưu tiên cao
                    </p>

                    <p className="mt-2 text-3xl font-bold text-foreground">
                        {highPriorityItems}
                    </p>
                </div>
            </section>

            {/* FORM THÊM MỤC TIÊU */}
            <section
                aria-labelledby="wishlist-form-heading"
                className="theme-surface rounded-2xl border border-line bg-card p-6 shadow-sm"
            >
                <div className="mb-6">
                    <h2
                        id="wishlist-form-heading"
                        className="text-xl font-bold text-foreground"
                    >
                        Thêm mục tiêu mới
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Nhập tên mục tiêu, số tiền dự kiến
                        và mức độ ưu tiên.
                    </p>
                </div>

                <WishlistForm />
            </section>

            {/* DANH SÁCH WISHLIST */}
            <section
                aria-labelledby="wishlist-list-heading"
                className="space-y-4"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2
                            id="wishlist-list-heading"
                            className="text-xl font-bold text-foreground"
                        >
                            Danh sách mục tiêu
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Quản lý và cập nhật các mục tiêu
                            tài chính của bạn.
                        </p>
                    </div>

                    <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
                        {totalItems} mục tiêu
                    </span>
                </div>

                <WishlistTable rows={wishlistItems} />
            </section>
        </main>
    );
}
