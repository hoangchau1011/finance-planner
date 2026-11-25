
"use client";

import {
    useActionState,
    useEffect,
    useRef,
} from "react";
import { toast } from "sonner";

import {
    createWishlist,
    updateWishlist,
} from "./actions";

import {
    initialWishlistState,
    WISHLIST_PRIORITIES,
    WISHLIST_PRIORITY_LABELS,
    type WishlistFormState,
} from "@/lib/wishlist-validation";

// ==========================================
// V1.0 - WISHLIST FORM
// ==========================================

type WishlistItem = {
    id: string;
    name: string;
    cost: number;
    priority: "LOW" | "MEDIUM" | "HIGH";
};

type WishlistFormProps = {
    item?: WishlistItem;
    onCancel?: () => void;
};

export function WishlistForm({
    item,
    onCancel,
}: WishlistFormProps) {
    const isEditing = Boolean(item);

    const formRef = useRef<HTMLFormElement>(null);

    // Chọn Server Action tương ứng với chế độ.
    const action = item
        ? updateWishlist.bind(null, item.id)
        : createWishlist;

    const [state, formAction, isPending] =
        useActionState(
            action,
            initialWishlistState
        );

    // Tránh hiển thị thông báo trùng lặp.
    const handledState = useRef<WishlistFormState>(
        initialWishlistState
    );

    useEffect(() => {
        if (handledState.current === state) {
            return;
        }

        handledState.current = state;

        if (state.ok) {
            toast.success(
                state.message ?? "Lưu mục tiêu thành công."
            );

            // Sau khi thêm, đưa form về trạng thái ban đầu.
            if (!isEditing) {
                formRef.current?.reset();
            }
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, isEditing]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-5"
        >
            {/* TÊN MỤC TIÊU */}
            <div className="space-y-2">
                <label
                    htmlFor="wishlist-name"
                    className="block text-sm font-medium text-foreground"
                >
                    Tên mục tiêu
                </label>

                <input
                    id="wishlist-name"
                    name="name"
                    type="text"
                    placeholder="Ví dụ: Mua laptop mới"
                    defaultValue={item?.name ?? ""}
                    maxLength={100}
                    required
                    disabled={isPending}
                    aria-invalid={Boolean(state.errors?.name)}
                    aria-describedby={
                        state.errors?.name
                            ? "wishlist-name-error"
                            : undefined
                    }
                    className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                />

                {state.errors?.name?.[0] && (
                    <p
                        id="wishlist-name-error"
                        role="alert"
                        className="text-sm text-red-500"
                    >
                        {state.errors.name[0]}
                    </p>
                )}
            </div>

            {/* CHI PHÍ MỤC TIÊU */}
            <div className="space-y-2">
                <label
                    htmlFor="wishlist-cost"
                    className="block text-sm font-medium text-foreground"
                >
                    Số tiền mục tiêu (VND)
                </label>

                <input
                    id="wishlist-cost"
                    name="cost"
                    type="number"
                    min="1"
                    max="2147483647"
                    step="1"
                    placeholder="Ví dụ: 5000000"
                    defaultValue={item?.cost ?? ""}
                    required
                    disabled={isPending}
                    aria-invalid={Boolean(state.errors?.cost)}
                    aria-describedby={
                        state.errors?.cost
                            ? "wishlist-cost-error"
                            : "wishlist-cost-hint"
                    }
                    className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                />

                <p
                    id="wishlist-cost-hint"
                    className="text-xs text-muted-foreground"
                >
                    Nhập số nguyên, không dùng dấu chấm hoặc dấu phẩy.
                </p>

                {state.errors?.cost?.[0] && (
                    <p
                        id="wishlist-cost-error"
                        role="alert"
                        className="text-sm text-red-500"
                    >
                        {state.errors.cost[0]}
                    </p>
                )}
            </div>

            {/* MỨC ƯU TIÊN */}
            <div className="space-y-2">
                <label
                    htmlFor="wishlist-priority"
                    className="block text-sm font-medium text-foreground"
                >
                    Mức ưu tiên
                </label>

                <select
                    id="wishlist-priority"
                    name="priority"
                    defaultValue={item?.priority ?? "MEDIUM"}
                    disabled={isPending}
                    required
                    aria-invalid={Boolean(state.errors?.priority)}
                    className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none transition-colors duration-300 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                >
                    {WISHLIST_PRIORITIES.map((priority) => (
                        <option
                            key={priority}
                            value={priority}
                        >
                            {WISHLIST_PRIORITY_LABELS[priority]}
                        </option>
                    ))}
                </select>

                {state.errors?.priority?.[0] && (
                    <p
                        role="alert"
                        className="text-sm text-red-500"
                    >
                        {state.errors.priority[0]}
                    </p>
                )}
            </div>

            {/* THÔNG BÁO TỪ SERVER */}
            {state.ok === false && state.message && (
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
                    disabled={isPending}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand px-5 py-3 font-semibold text-white transition-colors duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isPending
                        ? "Đang lưu..."
                        : isEditing
                            ? "Lưu thay đổi"
                            : "Thêm mục tiêu"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPending}
                        className="rounded-xl border border-line bg-card px-5 py-3 font-medium text-foreground transition-colors duration-300 hover:bg-muted disabled:opacity-60"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
}
