
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteBudget } from "./actions";
import {
    BudgetForm,
    type BudgetFormItem,
} from "./budget-form";

import {
    CATEGORY_LABELS,
    formatVND,
} from "@/lib/finance";

// ==========================================
// FINANCE PLANNER V1.0 - BUDGET LIST
// ==========================================

// Dữ liệu lấy từ Server Component.
// spentAmount được tính từ giao dịch EXPENSE,
// không lưu trực tiếp trong MonthlyBudget.
export type BudgetListItem = BudgetFormItem & {
    spentAmount: number;
};

type BudgetListProps = {
    items: BudgetListItem[];
};

// ==========================================
// 1. XÁC ĐỊNH TRẠNG THÁI NGÂN SÁCH
// ==========================================

function getBudgetStatus(item: BudgetListItem) {
    const ratio =
        item.limitAmount > 0
            ? (item.spentAmount / item.limitAmount) * 100
            : 0;

    const percentage = Math.max(
        0,
        Math.round(ratio)
    );

    // Thanh tiến độ chỉ dài tối đa 100%,
    // nhưng tỷ lệ hiển thị vẫn có thể >100%.
    const barWidth = Math.min(
        100,
        Math.max(0, ratio)
    );

    if (ratio > 100) {
        return {
            percentage,
            barWidth,
            label: "Vượt ngân sách",
            barColor: "bg-red-500",
            badgeColor:
                "bg-red-500/10 text-red-700 dark:text-red-300",
        };
    }

    if (ratio >= 100) {
        return {
            percentage,
            barWidth,
            label: "Đã dùng hết hạn mức",
            barColor: "bg-red-500",
            badgeColor:
                "bg-red-500/10 text-red-700 dark:text-red-300",
        };
    }

    if (ratio >= 80) {
        return {
            percentage,
            barWidth,
            label: "Sắp đạt hạn mức",
            barColor: "bg-amber-500",
            badgeColor:
                "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        };
    }

    return {
        percentage,
        barWidth,
        label: "Trong hạn mức",
        barColor: "bg-emerald-500",
        badgeColor:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
}

// ==========================================
// 2. ĐỊNH DẠNG THÁNG
// ==========================================

function formatBudgetMonth(month: string) {
    const [year, monthNumber] = month.split("-");

    return `Tháng ${monthNumber}/${year}`;
}

// ==========================================
// 3. COMPONENT DANH SÁCH
// ==========================================

export function BudgetList({
    items,
}: BudgetListProps) {
    const router = useRouter();

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [
        confirmDeleteId,
        setConfirmDeleteId,
    ] = useState<string | null>(null);

    const [deletingId, setDeletingId] =
        useState<string | null>(null);

    const [isPending, startTransition] =
        useTransition();

    // ========================================
    // 4. XÓA NGÂN SÁCH
    // ========================================

    function handleDelete(id: string) {
        if (isPending || deletingId !== null) {
            return;
        }

        setDeletingId(id);

        startTransition(async () => {
            try {
                const result = await deleteBudget(id);

                if (!result.ok) {
                    toast.error(result.message);
                    return;
                }

                toast.success(result.message);

                setEditingId(null);

                // Tải lại dữ liệu từ Server Component.
                router.refresh();
            } catch {
                toast.error(
                    "Có lỗi xảy ra khi xóa ngân sách."
                );
            } finally {
                setDeletingId(null);
                setConfirmDeleteId(null);
            }
        });
    }

    // ========================================
    // 5. DANH SÁCH RỖNG
    // ========================================

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-14 text-center">
                <div
                    aria-hidden="true"
                    className="mb-4 text-4xl text-brand"
                >
                    ◫
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                    Chưa có ngân sách
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Hãy đặt ngân sách cho một danh mục
                    để theo dõi chi tiêu và kiểm soát
                    hạn mức mỗi tháng.
                </p>
            </div>
        );
    }

    // ========================================
    // 6. DANH SÁCH NGÂN SÁCH
    // ========================================

    return (
        <div className="grid items-start gap-5 lg:grid-cols-2">
            {items.map((item) => {
                const status = getBudgetStatus(item);

                const isEditing =
                    editingId === item.id;

                const isConfirmingDelete =
                    confirmDeleteId === item.id;

                const isDeleting =
                    deletingId === item.id;

                const remaining =
                    item.limitAmount - item.spentAmount;

                return (
                    <article
                        key={item.id}
                        className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-sm transition-colors duration-200 hover:border-brand/30 sm:p-6"
                    >
                        {/* HEADER NGÂN SÁCH */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                                <h3 className="text-lg font-bold text-foreground">
                                    {CATEGORY_LABELS[item.category]}
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    {formatBudgetMonth(item.month)}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.badgeColor}`}
                            >
                                {status.label}
                            </span>
                        </div>

                        {/* SỐ TIỀN */}
                        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Đã chi
                                </p>

                                <p className="mt-1 break-all text-2xl font-bold tabular-nums text-foreground">
                                    {formatVND(item.spentAmount)}
                                </p>
                            </div>

                            <div className="text-left sm:text-right">
                                <p className="text-xs text-muted-foreground">
                                    Hạn mức
                                </p>

                                <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                                    {formatVND(item.limitAmount)}
                                </p>
                            </div>
                        </div>

                        {/* THANH TIẾN ĐỘ */}
                        <div className="mt-5 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Tiến độ sử dụng
                                </p>

                                <p className="text-sm font-bold tabular-nums text-foreground">
                                    {status.percentage}%
                                </p>
                            </div>

                            <div
                                role="progressbar"
                                aria-label={`Tiến độ ngân sách ${CATEGORY_LABELS[item.category]}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.min(
                                    100,
                                    status.percentage
                                )}
                                aria-valuetext={`${status.percentage}% ngân sách đã sử dụng`}
                                className="h-3 w-full overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${status.barColor}`}
                                    style={{
                                        width: `${status.barWidth}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* SỐ TIỀN CÒN LẠI HOẶC VƯỢT */}
                        <div className="mt-4 rounded-xl bg-muted/40 p-3">
                            {remaining > 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Còn lại:{" "}
                                    <strong className="text-foreground">
                                        {formatVND(remaining)}
                                    </strong>
                                </p>
                            ) : remaining === 0 ? (
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Đã sử dụng hết hạn mức ngân sách.
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Đã vượt:{" "}
                                    {formatVND(Math.abs(remaining))}
                                </p>
                            )}
                        </div>

                        {/* XÁC NHẬN XÓA */}
                        {isConfirmingDelete ? (
                            <div className="mt-5 space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                                <p className="text-sm font-medium text-foreground">
                                    Bạn có chắc muốn xóa ngân sách
                                    này không?
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Thao tác chỉ xóa hạn mức ngân sách,
                                    không xóa giao dịch đã ghi nhận.
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(item.id)
                                        }
                                        disabled={isPending}
                                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isDeleting
                                            ? "Đang xóa..."
                                            : "Xác nhận xóa"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmDeleteId(null)
                                        }
                                        disabled={isPending}
                                        className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* NÚT SỬA / XÓA */
                            <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => {
                                        setConfirmDeleteId(null);
                                        setEditingId(
                                            isEditing ? null : item.id
                                        );
                                    }}
                                    className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                                >
                                    {isEditing
                                        ? "Đóng chỉnh sửa"
                                        : "Sửa ngân sách"}
                                </button>

                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => {
                                        setEditingId(null);
                                        setConfirmDeleteId(item.id);
                                    }}
                                    className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400 disabled:opacity-50"
                                >
                                    Xóa
                                </button>
                            </div>
                        )}

                        {/* FORM CHỈNH SỬA */}
                        {isEditing && (
                            <div className="mt-6 border-t border-line pt-6">
                                <h4 className="mb-4 text-base font-bold text-foreground">
                                    Chỉnh sửa ngân sách
                                </h4>

                                <BudgetForm
                                    key={item.id}
                                    defaultMonth={item.month}
                                    item={{
                                        id: item.id,
                                        month: item.month,
                                        category: item.category,
                                        limitAmount: item.limitAmount,
                                    }}
                                    onCancel={() =>
                                        setEditingId(null)
                                    }
                                    onSaved={() => {
                                        setEditingId(null);
                                        router.refresh();
                                    }}
                                />
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
