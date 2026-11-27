
"use client";

import {
    useId,
    useState,
    useTransition,
    type FormEvent,
} from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { addWishlistSavings } from "./actions";
import { formatVND } from "@/lib/finance";

// ==========================================
// FINANCE PLANNER V1.0
// WISHLIST SAVINGS FORM
// ==========================================

export type WishlistSavingsItem = {
    id: string;
    name: string;
    cost: number;
    savedAmount: number;
};

type WishlistSavingsFormProps = {
    item: WishlistSavingsItem;
    onCancel?: () => void;
    onSaved?: () => void;
};

// ==========================================
// 1. COMPONENT
// ==========================================

export function WishlistSavingsForm({
    item,
    onCancel,
    onSaved,
}: WishlistSavingsFormProps) {
    const router = useRouter();
    const inputId = useId();

    const [amount, setAmount] = useState("");
    const [isPending, startTransition] =
        useTransition();

    // ========================================
    // 2. TÍNH TIẾN ĐỘ HIỆN TẠI
    // ========================================

    const remaining = Math.max(
        0,
        item.cost - item.savedAmount
    );

    const isCompleted = remaining === 0;

    const percentage =
        item.cost > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (item.savedAmount / item.cost) * 100
                )
            )
            : 0;

    // ========================================
    // 3. KIỂM TRA SỐ TIỀN NHẬP
    // ========================================

    function validateAmount(
        rawAmount: string
    ): string | null {
        const trimmed = rawAmount.trim();

        if (!/^[1-9]\d*$/.test(trimmed)) {
            return "Vui lòng nhập số nguyên dương.";
        }

        const numericAmount = Number(trimmed);

        if (
            !Number.isSafeInteger(numericAmount) ||
            numericAmount > 2_147_483_647
        ) {
            return "Số tiền vượt giới hạn cho phép.";
        }

        if (numericAmount > remaining) {
            return (
                "Số tiền thêm vào không được vượt " +
                formatVND(remaining) +
                "."
            );
        }

        return null;
    }

    // ========================================
    // 4. GỬI DỮ LIỆU LÊN SERVER
    // ========================================

    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (isPending || isCompleted) {
            return;
        }

        const validationError =
            validateAmount(amount);

        if (validationError) {
            toast.error(validationError);
            return;
        }

        const formData = new FormData();
        formData.set("amount", amount.trim());

        startTransition(async () => {
            try {
                const result =
                    await addWishlistSavings(
                        item.id,
                        formData
                    );

                if (!result.ok) {
                    toast.error(result.message);
                    return;
                }

                // Server Action trả thông báo theo
                // các mốc 50%, 75%, 100%.
                toast.success(result.message);

                // Xóa nội dung input sau khi lưu.
                setAmount("");

                // Báo cho component cha nếu cần
                // đóng form sau khi lưu.
                onSaved?.();

                // Tải lại dữ liệu từ Server Component.
                router.refresh();
            } catch {
                toast.error(
                    "Không thể kết nối để lưu tiền tiết kiệm."
                );
            }
        });
    }

    // ========================================
    // 5. GIAO DIỆN
    // ========================================

    return (
        <section className="space-y-5">
            {/* THÔNG TIN MỤC TIÊU */}
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                    Thêm tiền tiết kiệm
                </h3>

                <p className="text-sm text-muted-foreground">
                    Mục tiêu:{" "}
                    <span className="font-semibold text-foreground">
                        {item.name}
                    </span>
                </p>
            </div>

            {/* THỐNG KÊ */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">
                        Đã tiết kiệm
                    </p>

                    <p className="mt-2 break-all text-lg font-bold tabular-nums text-foreground">
                        {formatVND(item.savedAmount)}
                    </p>
                </div>

                <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">
                        Còn thiếu
                    </p>

                    <p className="mt-2 break-all text-lg font-bold tabular-nums text-foreground">
                        {formatVND(remaining)}
                    </p>
                </div>
            </div>

            {/* THANH TIẾN ĐỘ */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                        Tiến độ mục tiêu
                    </span>

                    <span className="text-sm font-bold tabular-nums text-brand">
                        {Math.round(percentage)}%
                    </span>
                </div>

                <div
                    role="progressbar"
                    aria-label={`Tiến độ tiết kiệm ${item.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(percentage)}
                    className="h-3 w-full overflow-hidden rounded-full bg-muted"
                >
                    <div
                        className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none"
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    Mục tiêu cần đạt: {formatVND(item.cost)}
                </p>
            </div>

            {/* ĐÃ HOÀN THÀNH */}
            {isCompleted ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Đã hoàn thành mục tiêu!
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Bạn đã dành đủ số tiền cần thiết
                        cho mục tiêu này.
                    </p>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="mt-4 rounded-xl border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            Đóng
                        </button>
                    )}
                </div>
            ) : (
                /* FORM THÊM TIỀN */
                <form
                    onSubmit={handleSubmit}
                    aria-busy={isPending}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor={inputId}
                            className="block text-sm font-semibold text-foreground"
                        >
                            Số tiền muốn thêm (VND)
                        </label>

                        <div className="relative">
                            <input
                                id={inputId}
                                name="amount"
                                type="number"
                                inputMode="numeric"
                                min="1"
                                max={remaining}
                                step="1"
                                required
                                autoComplete="off"
                                placeholder="Ví dụ: 500000"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                                disabled={isPending}
                                className="w-full rounded-xl border border-line bg-card px-4 py-3 pr-16 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                            />

                            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                                VND
                            </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Tối đa có thể thêm:{" "}
                            {formatVND(remaining)}
                        </p>
                    </div>

                    {/* NÚT THAO TÁC */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={
                                isPending ||
                                amount.trim() === ""
                            }
                            className="flex-1 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-background"
                        >
                            {isPending
                                ? "Đang lưu..."
                                : "Xác nhận thêm tiền"}
                        </button>

                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isPending}
                                className="rounded-xl border border-line px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            )}
        </section>
    );
}
