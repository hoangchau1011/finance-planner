
import * as z from "zod";

// ==========================================
// V1.0 - WISHLIST VALIDATION
// ==========================================

// Các mức ưu tiên phải khớp với Prisma enum Priority.
export const WISHLIST_PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
] as const;

// Tên hiển thị của mức ưu tiên.
export const WISHLIST_PRIORITY_LABELS = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
} as const;

// ==========================================
// 1. SCHEMA KIỂM TRA WISHLIST
// ==========================================

export const wishlistSchema = z.object({
    // Tên mục tiêu: không được để trống.
    name: z
        .string()
        .trim()
        .min(1, {
            error: "Vui lòng nhập tên mục tiêu.",
        })
        .max(100, {
            error: "Tên mục tiêu tối đa 100 ký tự.",
        }),

    // Chi phí mục tiêu, đơn vị VND.
    // FormData gửi lên dưới dạng chuỗi.
    cost: z
        .string()
        .trim()
        .regex(/^\d+$/, {
            error: "Số tiền phải là số nguyên dương.",
        })
        .transform(Number)
        .pipe(
            z
                .number()
                .int({
                    error: "Số tiền phải là số nguyên.",
                })
                .min(1, {
                    error: "Số tiền phải lớn hơn 0.",
                })
                .max(2_147_483_647, {
                    error: "Số tiền vượt giới hạn lưu trữ.",
                })
        ),

    // Mức ưu tiên hợp lệ.
    priority: z.enum(WISHLIST_PRIORITIES, {
        error: "Vui lòng chọn mức ưu tiên hợp lệ.",
    }),
});

// ==========================================
// 2. KIỂM TRA ID WISHLIST
// ==========================================

export const wishlistIdSchema = z
    .string()
    .trim()
    .min(1, {
        error: "ID mục tiêu không hợp lệ.",
    })
    .max(191, {
        error: "ID mục tiêu quá dài.",
    });

// ==========================================
// 3. KIỂU DỮ LIỆU FORM
// ==========================================

export type WishlistValues = {
    name: string;
    cost: string;
    priority: string;
};

export type WishlistField = keyof WishlistValues;

// Trạng thái trả về của Server Action.
export type WishlistFormState = {
    ok?: boolean;
    message?: string;

    errors?: Partial<
        Record<WishlistField, string[]>
    >;

    values?: WishlistValues;
};

export const initialWishlistState: WishlistFormState = {};

// ==========================================
// 4. ĐỌC DỮ LIỆU TỪ FORMDATA
// ==========================================

export function readWishlistValues(
    formData: FormData
): WishlistValues {
    return {
        name: String(formData.get("name") ?? ""),
        cost: String(formData.get("cost") ?? ""),
        priority: String(
            formData.get("priority") ?? ""
        ),
    };
}

// ==========================================
// 5. KIỂU DỮ LIỆU SAU KHI VALIDATE
// ==========================================

// Sau khi Zod kiểm tra:
// - name: string
// - cost: number
// - priority: LOW | MEDIUM | HIGH

export type ValidatedWishlist = z.infer<
    typeof wishlistSchema
>;


// ==========================================
// V1.0 - WISHLIST SAVINGS VALIDATION
// ==========================================

const MAX_WISHLIST_AMOUNT = 2_147_483_647;

// 1. Kiểm tra số tiền thêm vào mục tiêu.
// Người dùng phải thêm ít nhất 1 VND.
export const wishlistSavingsDepositSchema = z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, {
        error: "Số tiền thêm vào phải là số nguyên dương.",
    })
    .transform(Number)
    .pipe(
        z
            .number()
            .int()
            .min(1, {
                error: "Số tiền thêm vào phải lớn hơn 0.",
            })
            .max(MAX_WISHLIST_AMOUNT, {
                error: "Số tiền vượt giới hạn lưu trữ.",
            })
    );

// 2. Kiểm tra tổng số tiền đã tiết kiệm.
// Cho phép bằng 0 vì mục tiêu mới chưa có tiền.
export const wishlistSavedAmountSchema = z
    .number()
    .int({
        error: "Tiền tiết kiệm phải là số nguyên.",
    })
    .min(0, {
        error: "Tiền tiết kiệm không được âm.",
    })
    .max(MAX_WISHLIST_AMOUNT, {
        error: "Tiền tiết kiệm vượt giới hạn lưu trữ.",
    });

// 3. So sánh tiền tiết kiệm với chi phí mục tiêu.
export const wishlistSavingsSchema = z
    .object({
        cost: z
            .number()
            .int()
            .min(1)
            .max(MAX_WISHLIST_AMOUNT),

        savedAmount: wishlistSavedAmountSchema,
    })
    .refine(
        (data) => data.savedAmount <= data.cost,
        {
            path: ["savedAmount"],
            message:
                "Tiền tiết kiệm không được vượt số tiền mục tiêu.",
        }
    );

// 4. Kiểu dữ liệu sau khi kiểm tra.
export type ValidatedWishlistSavings = z.infer<
    typeof wishlistSavingsSchema
>;
