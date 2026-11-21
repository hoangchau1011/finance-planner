
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { CATEGORY_LABELS, formatVND } from "@/lib/finance";
import { deleteTransaction } from "./actions";
import {
    TransactionForm,
    type EditableTransaction,
} from "./transaction-form";

type TransactionTableProps = {
    rows: EditableTransaction[];
};

export function TransactionTable({
    rows,
}: TransactionTableProps) {
    const [editingId, setEditingId] = useState<string | null>(
        null,
    );

    const [isPending, startTransition] = useTransition();

    function handleDelete(id: string) {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa giao dịch này không?",
        );

        if (!confirmed) return;

        startTransition(async () => {
            try {
                const result = await deleteTransaction(id);

                if (result.ok) {
                    toast.success(result.message);

                    if (editingId === id) {
                        setEditingId(null);
                    }
                } else {
                    toast.error(result.message);
                }
            } catch {
                toast.error(
                    "Không thể xóa giao dịch. Vui lòng thử lại.",
                );
            }
        });
    }

    if (rows.length === 0) {
        return (
            <div
                role="status"
                className="rounded-2xl border border-line bg-card p-8 text-center"
            >
                <p className="font-semibold">
                    Chưa có giao dịch
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Bạn có thể thêm giao dịch mới hoặc thay đổi bộ lọc.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[720px] text-sm">
                <caption className="sr-only">
                    Danh sách giao dịch thu chi với thao tác sửa và xóa
                </caption>

                <thead>
                    <tr className="border-b border-line text-left text-muted-foreground">
                        <th scope="col" className="px-4 py-3">
                            Mô tả
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Danh mục
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Ngày
                        </th>
                        <th
                            scope="col"
                            className="px-4 py-3 text-right"
                        >
                            Số tiền
                        </th>
                        <th
                            scope="col"
                            className="px-4 py-3 text-right"
                        >
                            Thao tác
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row) => (
                        <TransactionRow
                            key={row.id}
                            row={row}
                            isEditing={editingId === row.id}
                            isPending={isPending}
                            onEdit={() =>
                                setEditingId(
                                    editingId === row.id ? null : row.id,
                                )
                            }
                            onDelete={() => handleDelete(row.id)}
                            onClose={() => setEditingId(null)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

type TransactionRowProps = {
    row: EditableTransaction;
    isEditing: boolean;
    isPending: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
};

function TransactionRow({
    row,
    isEditing,
    isPending,
    onEdit,
    onDelete,
    onClose,
}: TransactionRowProps) {
    const isIncome = row.type === "INCOME";

    return (
        <>
            <tr className="border-b border-line/60 last:border-b-0">
                <td className="px-4 py-4">
                    <div className="font-medium">
                        {row.description}
                    </div>

                    <span className="mt-1 block text-xs text-muted-foreground">
                        {isIncome ? "Thu nhập" : "Chi tiêu"}
                    </span>
                </td>

                <td className="px-4 py-4">
                    {CATEGORY_LABELS[row.category]}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                    {row.date}
                </td>

                <td
                    className={
                        "px-4 py-4 text-right font-semibold tabular-nums " +
                        (isIncome
                            ? "text-brand"
                            : "text-foreground")
                    }
                >
                    {isIncome ? "+" : "−"}
                    {formatVND(row.amount)}
                </td>

                <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onEdit}
                            disabled={isPending}
                            aria-expanded={isEditing}
                            aria-label={`Sửa giao dịch ${row.description}`}
                            className="rounded-lg border border-line px-3 py-1.5 font-medium transition-colors hover:bg-muted disabled:opacity-50"
                        >
                            {isEditing ? "Đóng" : "Sửa"}
                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isPending}
                            aria-label={`Xóa giao dịch ${row.description}`}
                            className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950"
                        >
                            {isPending ? "Đang xử lý..." : "Xóa"}
                        </button>
                    </div>
                </td>
            </tr>

            {isEditing && (
                <tr>
                    <td
                        colSpan={5}
                        className="border-b border-line bg-muted/40 p-5"
                    >
                        <h3 className="mb-4 text-lg font-semibold">
                            Chỉnh sửa giao dịch
                        </h3>

                        <TransactionForm
                            key={row.id}
                            transaction={row}
                            onSaved={onClose}
                            onCancel={onClose}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}
