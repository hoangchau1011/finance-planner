
"use client";

import {
    useActionState,
    useId,
    useState,
} from "react";
import { toast } from "sonner";

import {
    createBudget,
    updateBudget,
} from "./actions";

import {
    BUDGET_CATEGORIES,
    initialBudgetState,
    type BudgetFormState,
    type BudgetValues,
} from "@/lib/budget-validation";

import { CATEGORY_LABELS } from "@/lib/finance";

// ==========================================
// FINANCE PLANNER V1.0 - BUDGET FORM
// ==========================================

type BudgetCategory =
    (typeof BUDGET_CATEGORIES)[number];

export type BudgetFormItem = {
    id: string;
    month: string;
    category: BudgetCategory;
    limitAmount: number;
};

type BudgetFormProps = {
    // Tháng mặc định do Server Component cung cấp.
    defaultMonth: string;

    // Có item => chế độ chỉnh sửa.
    // Không có item => chế độ thêm mới.
    item?: BudgetFormItem;

    onCancel?: () => void;
    onSaved?: () => void;
};

// ==========================================
// 1. GIÁ TRỊ FORM MẶC ĐỊNH
// ==========================================

function getInitialValues(
    defaultMonth: string,
    item?: BudgetFormItem
): BudgetValues {
    return {
        month: item?.month ?? defaultMonth,
        category: item?.category ?? "FOOD",
        limitAmount:
            item
                ? String(item.limitAmount)
                : "",
    };
}

// ==========================================
// 2. COMPONENT BUDGET FORM
// ==========================================

export function BudgetForm({
    defaultMonth,
    item,
    onCancel,
    onSaved,
}: BudgetFormProps) {
    const isEditing = Boolean(item);

    // ID riêng để tránh trùng label khi
    // có nhiều form xuất hiện trên một trang.
    const formId = useId();

    // Controlled inputs giúp giữ lại dữ liệu
    // khi Server Action trả lỗi.
    const [values, setValues] =
        useState<BudgetValues>(() =>
            getInitialValues(defaultMonth, item)
        );

    // ========================================
    // 3. GỌI SERVER ACTION
    // ========================================

    const submitAction = async (
        previous: BudgetFormState,
        formData: FormData
    ): Promise<BudgetFormState> => {
        try {
            const result = item
                ? await updateBudget(
                    item.id,
                    previous,
                    formData
                )
                : await createBudget(
                    previous,
                    formData
                );

            if (result.ok) {
                toast.success(
                    result.message ??
                    "Lưu ngân sách thành công."
                );

                if (isEditing) {
                    onSaved?.();
                } else {
                    // Giữ tháng đang chọn để người dùng
                    // có thể thêm ngân sách danh mục khác.
                    setValues((current) => ({
                        month: current.month,
                        category: "FOOD",
                        limitAmount: "",
                    }));
                }
            } else if (result.message) {
                toast.error(result.message);
            }

            return result;
        } catch {
            const message =
                "Có lỗi kết nối. Vui lòng thử lại.";

            toast.error(message);

            return {
                ok: false,
                message,
            };
        }
    };

    const [state, formAction, isPending] =
        useActionState(
            submitAction,
            initialBudgetState
        );

    // ========================================
    // 4. GIAO DIỆN
    // ========================================

    return (
        <form
            action={formAction}
            aria-busy={isPending}
            className="space-y-5"
        >
            <fieldset
                disabled={isPending}
                className="space-y-5 disabled:opacity-70"
            >
                {/* THÁNG NGÂN SÁCH */}
                <div className="space-y-2">
                    <label
                        htmlFor={`${formId}-month`}
                        className="block text-sm font-semibold text-foreground"
                    >
                        Tháng áp dụng
                    </label>

                    <input
                        id={`${formId}-month`}
                        name="month"
                        type="month"
                        value={values.month}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                month: event.target.value,
                            }))
                        }
                        required
                        aria-invalid={
                            Boolean(state.errors?.month)
                        }
                        aria-describedby={
                            state.errors?.month
                                ? `${formId}-month-error`
                                : undefined
                        }
                        className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />

                    {state.errors?.month?.[0] && (
                        <p
                            id={`${formId}-month-error`}
                            role="alert"
                            className="text-sm text-red-500"
                        >
                            {state.errors.month[0]}
                        </p>
                    )}
                </div>

                {/* DANH MỤC CHI TIÊU */}
                <div className="space-y-2">
                    <label
                        htmlFor={`${formId}-category`}
                        className="block text-sm font-semibold text-foreground"
                    >
                        Danh mục chi tiêu
                    </label>

                    <select
                        id={`${formId}-category`}
                        name="category"
                        value={values.category}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                category: event.target.value,
                            }))
                        }
                        required
                        aria-invalid={
                            Boolean(state.errors?.category)
                        }
                        className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                        {BUDGET_CATEGORIES.map(
                            (category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {CATEGORY_LABELS[category]}
                                </option>
                            )
                        )}
                    </select>

                    {state.errors?.category?.[0] && (
                        <p
                            role="alert"
                            className="text-sm text-red-500"
                        >
                            {state.errors.category[0]}
                        </p>
                    )}
                </div>

                {/* HẠN MỨC NGÂN SÁCH */}
                <div className="space-y-2">
                    <label
                        htmlFor={`${formId}-amount`}
                        className="block text-sm font-semibold text-foreground"
                    >
                        Hạn mức ngân sách (VND)
                    </label>

                    <div className="relative">
                        <input
                            id={`${formId}-amount`}
                            name="limitAmount"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="2147483647"
                            step="1"
                            placeholder="Ví dụ: 2000000"
                            value={values.limitAmount}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    limitAmount: event.target.value,
                                }))
                            }
                            required
                            aria-invalid={
                                Boolean(state.errors?.limitAmount)
                            }
                            aria-describedby={
                                `${formId}-amount-hint`
                            }
                            className="w-full rounded-xl border border-line bg-card px-4 py-3 pr-16 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />

                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                            VND
                        </span>
                    </div>

                    <p
                        id={`${formId}-amount-hint`}
                        className="text-xs text-muted-foreground"
                    >
                        Nhập số nguyên, không dùng dấu chấm
                        hoặc dấu phẩy.
                    </p>

                    {state.errors?.limitAmount?.[0] && (
                        <p
                            role="alert"
                            className="text-sm text-red-500"
                        >
                            {state.errors.limitAmount[0]}
                        </p>
                    )}
                </div>

                {/* THÔNG BÁO LỖI */}
                {state.ok === false &&
                    state.message && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
                        >
                            {state.message}
                        </p>
                    )}

                {/* NÚT THAO TÁC */}
                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        type="submit"
                        className="inline-flex min-w-[160px] flex-1 items-center justify-center rounded-xl bg-brand px-5 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-background"
                    >
                        {isPending
                            ? "Đang lưu..."
                            : isEditing
                                ? "Lưu thay đổi"
                                : "Thêm ngân sách"}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-xl border border-line bg-card px-5 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </fieldset>
        </form>
    );
}
