import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import {
    requireUser,
    UnauthorizedError,
} from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import {
    getVietnamMonthRange,
} from "@/lib/finance";

import {
    getRecentCashFlowAverage,
} from "@/lib/financial-simulator";

import {
    FinancialSimulator,
} from "@/components/financial-simulator";

// ==========================================
// FINANCE PLANNER V1.0
// FINANCIAL SIMULATOR PAGE
// ==========================================

export const metadata: Metadata = {
    title: "Mô phỏng tài chính | Finance Planner",
    description:
        "Mô phỏng kế hoạch tiết kiệm, so sánh các kịch bản tài chính và ước tính thời gian đạt mục tiêu.",
};

// ==========================================
// 1. SERVER COMPONENT
// ==========================================

export default async function SimulatorPage() {
    // ========================================
    // BƯỚC 1 - XÁC THỰC NGƯỜI DÙNG
    // ========================================


    // Kiểm tra quyền truy cập.
    // Chưa đăng nhập thì chuyển đến /login.
    const user = await requireUser().catch(
        (error: unknown) => {
            if (error instanceof UnauthorizedError) {
                return null;
            }

            // Giữ nguyên các lỗi khác để dễ phát hiện.
            throw error;
        }
    );

    if (!user) {
        redirect("/login");
    }

    // Chỉ sử dụng userId từ session hợp lệ.
    const userId = user.id;


    // ========================================
    // BƯỚC 2 - XÁC ĐỊNH THỜI GIAN
    // ========================================

    const now = new Date();

    // Bắt đầu từ 3 tháng trước.
    const threeMonthsAgo = getVietnamMonthRange(
        now,
        -3
    );

    // Đầu tháng hiện tại.
    // Không tính tháng đang diễn ra.
    const currentMonth = getVietnamMonthRange(
        now
    );

    // ========================================
    // BƯỚC 3 - TRUY VẤN NEON
    // ========================================

    // Hai truy vấn độc lập có thể chạy song song.
    const [wishlistItems, transactions] =
        await Promise.all([
            // Lấy Wishlist của user hiện tại.
            prisma.wishlistItem.findMany({
                where: {
                    userId,
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
                },
            }),

            // Lấy giao dịch trong 3 tháng
            // đã hoàn thành gần nhất.
            prisma.transaction.findMany({
                where: {
                    userId,

                    date: {
                        gte: threeMonthsAgo.gte,
                        lt: currentMonth.gte,
                    },
                },

                select: {
                    type: true,
                    amount: true,
                    date: true,
                },

                orderBy: [
                    { date: "asc" },
                    { id: "asc" },
                ],
            }),
        ]);

    // ========================================
    // BƯỚC 4 - PHÂN TÍCH DÒNG TIỀN
    // ========================================

    // Dùng hàm đã viết và kiểm thử
    // trong File 36 - 37.
    const cashFlow = getRecentCashFlowAverage(
        transactions,
        now,
        3
    );

    // ========================================
    // BƯỚC 5 - TRẢ GIAO DIỆN
    // ========================================

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">

            {/* HEADER */}
            <header className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-brand hover:underline"
                    >
                        ← Quay về Dashboard
                    </Link>

                    <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                        Finance Planner · v1.0
                    </span>
                </div>

                <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                        Lập kế hoạch tài chính
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Mô phỏng tài chính
                    </h1>

                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                        Lựa chọn mục tiêu tiết kiệm, điều chỉnh
                        kế hoạch hằng tháng và khám phá những
                        kịch bản giúp bạn dự kiến thời gian
                        đạt được mục tiêu.
                    </p>
                </div>
            </header>

            {/* THÔNG TIN */}
            <section className="rounded-2xl border border-brand/20 bg-brand/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <span
                        aria-hidden="true"
                        className="text-xl"
                    >
                        💡
                    </span>

                    <div className="space-y-2">
                        <h2 className="font-semibold text-foreground">
                            Mô phỏng không thay đổi dữ liệu thật
                        </h2>

                        <p className="text-sm leading-6 text-muted-foreground">
                            Hệ thống chỉ đọc giao dịch và mục tiêu
                            Wishlist thuộc tài khoản của bạn.
                            Việc điều chỉnh các kịch bản không
                            tự động thêm, sửa hoặc xóa dữ liệu
                            trên Neon.
                        </p>
                    </div>
                </div>
            </section>

            {/* COMPONENT MÔ PHỎNG */}
            <FinancialSimulator
                goals={wishlistItems}
                cashFlow={cashFlow}
            />

            {/* FOOTER TRANG */}
            <div className="rounded-xl border border-line bg-card px-5 py-4">
                <p className="text-xs leading-6 text-muted-foreground">
                    Lưu ý: Kết quả là ước tính dựa trên
                    dữ liệu giao dịch đã ghi nhận và
                    các giả định do người dùng lựa chọn.
                    Không bảo đảm kết quả tài chính thực tế.
                </p>
            </div>
        </main>
    );
}
