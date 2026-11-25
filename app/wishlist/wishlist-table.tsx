
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteWishlist } from "./actions";
import { WishlistForm } from "./wishlist-form";

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
                                        setConfirmDeleteId(null);

                                        setEditingId(
                                            isEditing ? null : item.id
                                        );
                                    }}
                                    onCancelEdit={() =>
                                        setEditingId(null)
                                    }
                                    onRequestDelete={() => {
                                        setEditingId(null);
                                        setConfirmDeleteId(item.id);
                                    }}
                                    onCancelDelete={() =>
                                        setConfirmDeleteId(null)
                                    }
                                    onDelete={() =>
                                        handleDelete(item.id)
                                    }
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
}: FragmentRowProps) {
    return (
        <Fragment>
            {/* DÒNG HIỂN THỊ MỤC TIÊU */}
            <tr className="transition-colors duration-300 hover:bg-muted/50">
                <td className="px-5 py-4">
                    <span className="font-medium text-foreground">
                        {item.name}
                    </span>
                </td>

                <td className="px-5 py-4 font-semibold text-foreground">
                    {formatVND(item.cost)}
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
                        <div className="flex items-center justify-end gap-2">
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
        </Fragment>
    );
}
