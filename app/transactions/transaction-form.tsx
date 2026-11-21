
"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { toast } from "sonner";

import { CATEGORY_LABELS } from "@/lib/finance";

import {
    createTransaction,
    updateTransaction,
} from "./actions";

import {
    initialTransactionState,
    type TransactionValues,
} from "@/lib/validation";

// Dữ liệu của giao dịch khi người dùng chọn sửa
export type EditableTransaction = {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    category: keyof typeof CATEGORY_LABELS;
    date: string;
};

type TransactionFormProps = {
    transaction?: EditableTransaction;
    onSaved?: () => void;
    onCancel?: () => void;
};

// Ngày hiện tại theo múi giờ Việt Nam
function getVietnamToday(): string {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const getPart = (type: "year" | "month" | "day") =>
        parts.find((part) => part.type === type)?.value ?? "";

    return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function TransactionForm({
    transaction,
    onSaved,
    onCancel,
}: TransactionFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const formId = useId();

    // Nếu có transaction thì sửa, nếu không thì thêm mới
    const action = transaction
        ? updateTransaction.bind(null, transaction.id)
        : createTransaction;

    const [state, formAction, isPending] = useActionState(
        action,
        initialTransactionState,
    );

    // Tránh xử lý lại cùng một kết quả Server Action
    const handledState = useRef<typeof state>(
        initialTransactionState,
    );

    useEffect(() => {
        if (!state.message || handledState.current === state) {
            return;
        }

        handledState.current = state;

        if (state.ok) {
            toast.success(state.message);

            if (!transaction) {
                formRef.current?.reset();
            }

            onSaved?.();
        } else {
            toast.error(state.message);
        }
    }, [state, transaction, onSaved]);

    // Giá trị ban đầu khi thêm hoặc sửa
    const initialValues: TransactionValues = {
        type: transaction?.type ?? "EXPENSE",
        amount: transaction ? String(transaction.amount) : "",
        description: transaction?.description ?? "",
        category: transaction?.category ?? "FOOD",
        date: transaction?.date ?? getVietnamToday(),
    };

    // Giữ lại dữ liệu người dùng nhập nếu validate thất bại
    const values = state.values ?? initialValues;

    // Lấy lỗi đầu tiên của từng trường
    function getError(field: keyof TransactionValues) {
        return state.errors?.[field]?.[0];
    }

    function fieldId(field: keyof TransactionValues) {
        return `${formId}-${field}`;
    }

    function errorId(field: keyof TransactionValues) {
        return `${formId}-${field}-error`;
    }

    const inputClass =
        "w-full rounded-xl border border-line bg-background " +
        "px-3 py-2.5 text-sm text-foreground " +
        "focus-visible:outline-2 focus-visible:outline-brand";

    return (
        <form
            ref={formRef}
            action={formAction}
            noValidate
            className="grid gap-4"
            aria-label={
                transaction ? "Sửa giao dịch" : "Thêm giao dịch"
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {/* LOẠI GIAO DỊCH */}
                <div>
                    <label
                        htmlFor={fieldId("type")}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Loại giao dịch
                    </label>

                    <select
                        id={fieldId("type")}
                        name="type"
                        key={`type-${values.type}`}
                        defaultValue={values.type}
                        aria-invalid={Boolean(getError("type"))}
                        aria-describedby={
                            getError("type") ? errorId("type") : undefined
                        }
                        className={inputClass}
                    >
                        <option value="EXPENSE">Chi tiêu</option>
                        <option value="INCOME">Thu nhập</option>
                    </select>

                    {getError("type") && (
                        <p
                            id={errorId("type")}
                            role="alert"
                            className="mt-1 text-sm text-red-600"
                        >
                            {getError("type")}
                        </p>
                    )}
                </div>

                {/* SỐ TIỀN */}
                <div>
                    <label
                        htmlFor={fieldId("amount")}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Số tiền (VND)
                    </label>

                    <input
                        id={fieldId("amount")}
                        name="amount"
                        type="text"
                        inputMode="numeric"
                        key={`amount-${values.amount}`}
                        defaultValue={values.amount}
                        placeholder="Ví dụ: 150000"
                        aria-invalid={Boolean(getError("amount"))}
                        aria-describedby={
                            getError("amount") ? errorId("amount") : undefined
                        }
                        className={inputClass}
                    />

                    {getError("amount") && (
                        <p
                            id={errorId("amount")}
                            role="alert"
                            className="mt-1 text-sm text-red-600"
                        >
                            {getError("amount")}
                        </p>
                    )}
                </div>

                {/* MÔ TẢ */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor={fieldId("description")}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Mô tả giao dịch
                    </label>

                    <input
                        id={fieldId("description")}
                        name="description"
                        type="text"
                        maxLength={120}
                        key={`description-${values.description}`}
                        defaultValue={values.description}
                        placeholder="Ví dụ: Ăn trưa"
                        aria-invalid={Boolean(getError("description"))}
                        aria-describedby={
                            getError("description")
                                ? errorId("description")
                                : undefined
                        }
                        className={inputClass}
                    />

                    {getError("description") && (
                        <p
                            id={errorId("description")}
                            role="alert"
                            className="mt-1 text-sm text-red-600"
                        >
                            {getError("description")}
                        </p>
                    )}
                </div>

                {/* DANH MỤC */}
                <div>
                    <label
                        htmlFor={fieldId("category")}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Danh mục
                    </label>

                    <select
                        id={fieldId("category")}
                        name="category"
                        key={`category-${values.category}`}
                        defaultValue={values.category}
                        aria-invalid={Boolean(getError("category"))}
                        aria-describedby={
                            getError("category")
                                ? errorId("category")
                                : undefined
                        }
                        className={inputClass}
                    >
                        {Object.entries(CATEGORY_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ),
                        )}
                    </select>

                    {getError("category") && (
                        <p
                            id={errorId("category")}
                            role="alert"
                            className="mt-1 text-sm text-red-600"
                        >
                            {getError("category")}
                        </p>
                    )}
                </div>

                {/* NGÀY */}
                <div>
                    <label
                        htmlFor={fieldId("date")}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Ngày giao dịch
                    </label>

                    <input
                        id={fieldId("date")}
                        name="date"
                        type="date"
                        key={`date-${values.date}`}
                        defaultValue={values.date}
                        aria-invalid={Boolean(getError("date"))}
                        aria-describedby={
                            getError("date") ? errorId("date") : undefined
                        }
                        className={inputClass}
                    />

                    {getError("date") && (
                        <p
                            id={errorId("date")}
                            role="alert"
                            className="mt-1 text-sm text-red-600"
                        >
                            {getError("date")}
                        </p>
                    )}
                </div>
            </div>

            {/* NÚT THAO TÁC */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className={
                        "rounded-xl bg-brand px-5 py-2.5 " +
                        "font-semibold text-white " +
                        "disabled:cursor-not-allowed disabled:opacity-50 " +
                        "dark:text-background"
                    }
                >
                    {isPending
                        ? "Đang lưu..."
                        : transaction
                            ? "Lưu thay đổi"
                            : "Thêm giao dịch"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPending}
                        className="rounded-xl border border-line px-5 py-2.5"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
}
