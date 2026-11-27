
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteWishlist } from "./actions";
import { WishlistForm } from "./wishlist-form";
import { WishlistSavingsForm } from "./savings-form";

import {
    WISHLIST_PRIORITY_LABELS,
} from "@/lib/wishlist-validation";

// ==========================================
// V1.0 - WISHLIST TABLE
// ==========================================

export type WishlistTableRow = {
    id: string;
    name: string;
    cost: number;
    savedAmount: number;
    priority: "LOW" | "MEDIUM" | "HIGH";
};

type WishlistTableProps = {
    rows: WishlistTableRow[];
};

// Định dạng số tiền VND nhất quán giữa
// server và client, tránh lỗi hydration.
function formatVND(value: number): string {
    const formatted = String(value).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "."
    );

    return `${formatted} đ`;
}

// Giao diện mức ưu tiên.
const priorityStyles = {
    LOW: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    HIGH: "bg-red-500/10 text-red-700 dark:text-red-300",
} as const;

export function WishlistTable({
    rows,
}: WishlistTableProps) {
    const router = useRouter();

    // Mục tiêu đang chỉnh sửa.
    const [editingId, setEditingId] = useState<
        string | null
    >(null);

    // Mục tiêu đang mở form thêm tiền tiết kiệm.
    const [savingId, setSavingId] = useState<
        string | null
    >(null);


    // Mục tiêu đang chờ xác nhận xóa.
    const [confirmDeleteId, setConfirmDeleteId] =
        useState<string | null>(null);

    // Trạng thái xóa.
    const [isPending, startTransition] =
        useTransition();

    // ========================================
    // XÓA WISHLIST
    // ========================================

    function handleDelete(id: string) {
        if (isPending) return;

        startTransition(async () => {
            try {
                // Server Action tự kiểm tra
                // session và quyền sở hữu dữ liệu.
                const result = await deleteWishlist(id);

                if (!result.ok) {
                    toast.error(
                        result.message ??
                        "Không thể xóa mục tiêu."
                    );
                    return;
                }

                toast.success(
                    result.message ??
                    "Đã xóa mục tiêu."
                );

                // Cập nhật danh sách từ server.
                router.refresh();
            } catch {
                toast.error(
                    "Có lỗi xảy ra khi xóa mục tiêu."
                );
            } finally {
                setConfirmDeleteId(null);
            }
        });
    }

    // ========================================
    // TRẠNG THÁI CHƯA CÓ WISHLIST
    // ========================================

    if (rows.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-14 text-center">
                <div
                    aria-hidden="true"
                    className="mb-4 text-4xl"
                >
                    ☆
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                    Chưa có mục tiêu tiết kiệm
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Hãy thêm mục tiêu đầu tiên để bắt đầu
                    lập kế hoạch cho những điều bạn muốn
                    thực hiện.
                </p>
            </div>
        );
    }

    // ========================================
    // BẢNG DANH SÁCH WISHLIST
    // ========================================

    return (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="border-b border-line bg-muted">
                        <tr>
                            <th
                                scope="col"
                                className="px-5 py-4 font-semibold text-foreground"
                            >
                                Tên mục tiêu
                            </th>

                            <th
                                scope="col"
                                className="px-5 py-4 font-semibold text-foreground"
                            >
                                Số tiền
                            </th>

                            <th
                                scope="col"
                                className="px-5 py-4 font-semibold text-foreground"
                            >
                                Ưu tiên
                            </th>

                            <th
                                scope="col"
                                className="px-5 py-4 text-right font-semibold text-foreground"
                            >
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-line">
                        {rows.map((item) => {
                            const isEditing =
                                editingId === item.id;

                            const isConfirmingDelete =
                                confirmDeleteId === item.id;

                            const isSaving = savingId === item.id;

                            return (
                                <FragmentRow
                                    key={item.id}
                                    item={item}
                                    isEditing={isEditing}
                                    isConfirmingDelete={
                                        isConfirmingDelete
                                    }
                                    isDeleting={isPending}
                                    onEdit={() => {
                                        setSavingId(null);
                                        setConfirmDeleteId(null);

                                        setEditingId(
                                            isEditing ? null : item.id
                                        );
                                    }}
                                    onCancelEdit={() =>
                                        setEditingId(null)
                                    }
                                    onRequestDelete={() => {
                                        setSavingId(null);
                                        setEditingId(null);
                                        setConfirmDeleteId(item.id);
                                    }}
                                    onCancelDelete={() =>
                                        setConfirmDeleteId(null)
                                    }
                                    onDelete={() =>
                                        handleDelete(item.id)
                                    }
                                    isSaving={isSaving}
                                    onToggleSaving={() => {
                                        setEditingId(null);
                                        setConfirmDeleteId(null);
                                        setSavingId(isSaving ? null : item.id);
                                    }}
                                    onCancelSaving={() => {
                                        setSavingId(null);
                                    }}
                                    onSavingsSaved={() => {
                                        setSavingId(null);
                                    }}

                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==========================================
// ROW COMPONENT
// ==========================================

import { Fragment } from "react";

type FragmentRowProps = {
    item: WishlistTableRow;
    isEditing: boolean;
    isConfirmingDelete: boolean;
    isDeleting: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onRequestDelete: () => void;
    onCancelDelete: () => void;
    onDelete: () => void;
    isSaving: boolean;
    onToggleSaving: () => void;
    onCancelSaving: () => void;
    onSavingsSaved: () => void;
};

function FragmentRow({
    item,
    isEditing,
    isConfirmingDelete,
    isDeleting,
    onEdit,
    onCancelEdit,
    onRequestDelete,
    onCancelDelete,
    onDelete,
    isSaving,
    onToggleSaving,
    onCancelSaving,
    onSavingsSaved,
}: FragmentRowProps) {

    const savingsPercentage =
        item.cost > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (item.savedAmount / item.cost) * 100
                )
            )
            : 0;

    return (
        <Fragment>
            {/* DÒNG HIỂN THỊ MỤC TIÊU */}
            <tr className="transition-colors duration-300 hover:bg-muted/50">
                <td className="px-5 py-4">
                    <span className="font-medium text-foreground">
                        {item.name}
                    </span>
                </td>


                <td className="px-5 py-4">
                    <p className="font-semibold text-foreground">
                        {formatVND(item.cost)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Đã tiết kiệm: {formatVND(item.savedAmount)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <div
                            role="progressbar"
                            aria-label={`Tiến độ tiết kiệm ${item.name}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(savingsPercentage)}
                            className="h-2 w-28 overflow-hidden rounded-full bg-muted"
                        >
                            <div
                                className="h-full rounded-full bg-brand transition-[width] duration-500"
                                style={{
                                    width: `${savingsPercentage}%`,
                                }}
                            />
                        </div>

                        <span className="text-xs font-semibold text-brand">
                            {Math.round(savingsPercentage)}%
                        </span>
                    </div>

                    {item.savedAmount >= item.cost && (
                        <p className="mt-2 text-xs font-semibold text-emerald-600">
                            Đã đạt mục tiêu
                        </p>
                    )}
                </td>


                <td className="px-5 py-4">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[item.priority]}`}
                    >
                        {
                            WISHLIST_PRIORITY_LABELS[
                            item.priority
                            ]
                        }
                    </span>
                </td>

                <td className="px-5 py-4">
                    {isConfirmingDelete ? (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">
                                Xác nhận xóa?
                            </span>

                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={isDeleting}
                                className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting
                                    ? "Đang xóa..."
                                    : "Xóa"}
                            </button>

                            <button
                                type="button"
                                onClick={onCancelDelete}
                                disabled={isDeleting}
                                className="rounded-lg border border-line px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-end gap-2">

                            <button
                                type="button"
                                onClick={onToggleSaving}
                                disabled={isDeleting}
                                aria-label={`Thêm tiền tiết kiệm cho ${item.name}`}
                                className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                            >
                                {isSaving ? "Đóng" : "Thêm tiền"}
                            </button>

                            <button
                                type="button"
                                onClick={onEdit}
                                disabled={isDeleting}
                                aria-label={`Sửa mục tiêu ${item.name}`}
                                className="rounded-lg border border-line px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                            >
                                {isEditing ? "Đóng" : "Sửa"}
                            </button>

                            <button
                                type="button"
                                onClick={onRequestDelete}
                                disabled={isDeleting}
                                aria-label={`Xóa mục tiêu ${item.name}`}
                                className="rounded-lg border border-red-500/30 px-3 py-2 font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400 disabled:opacity-50"
                            >
                                Xóa
                            </button>
                        </div>
                    )}
                </td>
            </tr>

            {/* FORM CHỈNH SỬA MỞ BÊN DƯỚI */}
            {isEditing && (
                <tr>
                    <td
                        colSpan={4}
                        className="bg-muted/30 px-5 py-6"
                    >
                        <section
                            aria-label={`Chỉnh sửa ${item.name}`}
                            className="mx-auto max-w-2xl space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-foreground">
                                Chỉnh sửa mục tiêu
                            </h3>

                            <WishlistForm
                                key={item.id}
                                item={item}
                                onCancel={onCancelEdit}
                            />
                        </section>
                    </td>
                </tr>
            )}

            {/* FORM THÊM TIỀN TIẾT KIỆM */}
            {isSaving && (
                <tr>
                    <td
                        colSpan={4}
                        className="bg-muted/30 px-5 py-6"
                    >
                        <div className="mx-auto max-w-2xl">
                            <WishlistSavingsForm
                                key={`${item.id}-${item.savedAmount}`}
                                item={{
                                    id: item.id,
                                    name: item.name,
                                    cost: item.cost,
                                    savedAmount: item.savedAmount,
                                }}
                                onCancel={onCancelSaving}
                                onSaved={onSavingsSaved}
                            />
                        </div>
                    </td>
                </tr>
            )}

        </Fragment>
    );
}
