
import * as z from "zod";

// ==========================================
// FINANCE PLANNER V1.0 - BUDGET VALIDATION
// ==========================================

// Danh mục dành cho ngân sách chi tiêu.
// Loại SALARY vì đây là danh mục thu nhập.
export const BUDGET_CATEGORIES = [
    "FOOD",
    "TRANSPORT",
    "ENTERTAINMENT",
    "SHOPPING",
    "BILLS",
    "INVESTMENT",
    "OTHER",
] as const;

// ==========================================
// 1. KIỂM TRA THÁNG
// ==========================================

// Tháng theo định dạng YYYY-MM.
// Ví dụ: 2026-11, 2026-12.
export const budgetMonthSchema = z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
        error: "Tháng phải có định dạng YYYY-MM hợp lệ.",
    });

// ==========================================
// 2. KIỂM TRA DỮ LIỆU NGÂN SÁCH
// ==========================================

export const budgetSchema = z.object({
    month: budgetMonthSchema,

    category: z.enum(BUDGET_CATEGORIES, {
        error: "Vui lòng chọn danh mục chi tiêu hợp lệ.",
    }),

    // FormData gửi hạn mức dưới dạng chuỗi.
    limitAmount: z
        .string()
        .trim()
        .regex(/^\d+$/, {
            error: "Hạn mức phải là số nguyên dương.",
        })
        .transform(Number)
        .pipe(
            z
                .number()
                .int({
                    error: "Hạn mức phải là số nguyên.",
                })
                .min(1, {
                    error: "Hạn mức phải lớn hơn 0.",
                })
                .max(2_147_483_647, {
                    error: "Hạn mức vượt giới hạn lưu trữ.",
                })
        ),
});

// ==========================================
// 3. KIỂM TRA ID NGÂN SÁCH
// ==========================================

export const budgetIdSchema = z
    .string()
    .trim()
    .min(1, {
        error: "ID ngân sách không hợp lệ.",
    })
    .max(191, {
        error: "ID ngân sách quá dài.",
    });

// ==========================================
// 4. KIỂU DỮ LIỆU FORM
// ==========================================

export type BudgetValues = {
    month: string;
    category: string;
    limitAmount: string;
};

export type BudgetField = keyof BudgetValues;

export type BudgetFormState = {
    ok?: boolean;
    message?: string;

    errors?: Partial<
        Record<BudgetField, string[]>
    >;

    values?: BudgetValues;
};

export const initialBudgetState: BudgetFormState = {};

// ==========================================
// 5. ĐỌC DỮ LIỆU TỪ FORMDATA
// ==========================================

export function readBudgetValues(
    formData: FormData
): BudgetValues {
    return {
        month: String(formData.get("month") ?? ""),
        category: String(
            formData.get("category") ?? ""
        ),
        limitAmount: String(
            formData.get("limitAmount") ?? ""
        ),
    };
}

// ==========================================
// 6. KIỂU DỮ LIỆU SAU VALIDATION
// ==========================================

export type ValidatedBudget = z.infer<
    typeof budgetSchema
>;
