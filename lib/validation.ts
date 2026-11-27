import * as z from "zod";

const TYPES = ["INCOME", "EXPENSE"] as const;

const CATEGORIES = [
    "FOOD",
    "TRANSPORT",
    "ENTERTAINMENT",
    "SHOPPING",
    "BILLS",
    "SALARY",
    "INVESTMENT",
    "OTHER",
] as const;

export const RANGES = [
    "this-month",
    "last-month",
    "all",
] as const;

// Schema kiểm tra dữ liệu giao dịch
export const transactionSchema = z.object({
    type: z.enum(TYPES, {
        error: "Chọn loại giao dịch hợp lệ",
    }),

    amount: z
        .string()
        .trim()
        .regex(/^\d+$/, {
            error: "Số tiền phải là số nguyên dương",
        })
        .transform(Number)
        .pipe(
            z
                .number()
                .int({
                    error: "Số tiền phải là số nguyên",
                })
                .min(1, {
                    error: "Số tiền phải lớn hơn 0",
                })
                .max(2_147_483_647, {
                    error: "Số tiền vượt giới hạn lưu trữ",
                }),
        ),

    description: z
        .string()
        .trim()
        .min(1, {
            error: "Vui lòng nhập mô tả",
        })
        .max(120, {
            error: "Mô tả tối đa 120 ký tự",
        }),

    category: z.enum(CATEGORIES, {
        error: "Chọn danh mục hợp lệ",
    }),

    date: z.iso.date({
        error: "Ngày phải có định dạng YYYY-MM-DD hợp lệ",
    }),
});

// Kiểm tra ID giao dịch
export const transactionIdSchema = z.string().min(1).max(191);

// Kiểu dữ liệu form
export type TransactionValues = {
    type: string;
    amount: string;
    description: string;
    category: string;
    date: string;
};

export type TransactionField = keyof TransactionValues;

// Trạng thái form sau khi submit
export type TransactionFormState = {
    ok?: boolean;
    message?: string;
    errors?: Partial<Record<TransactionField, string[]>>;
    values?: TransactionValues;
};

export const initialTransactionState: TransactionFormState = {};

// Đọc dữ liệu từ FormData
export function readTransactionValues(
    data: FormData,
): TransactionValues {
    return {
        type: String(data.get("type") ?? ""),
        amount: String(data.get("amount") ?? ""),
        description: String(data.get("description") ?? ""),
        category: String(data.get("category") ?? ""),
        date: String(data.get("date") ?? ""),
    };
}

// Schema bộ lọc giao dịch
export const transactionFilterSchema = z.object({
    range: z.enum(RANGES).default("this-month"),
    type: z.enum(TYPES).optional(),
    category: z.enum(CATEGORIES).optional(),
    // V1.0 - Tìm kiếm mô tả giao dịch
    q: z.string().trim().max(120).optional(),
});

export type TransactionFilters = z.infer<
    typeof transactionFilterSchema
>;

// Kiểm tra và chuẩn hóa bộ lọc trên URL
export function parseTransactionFilters(
    search: Record<
        string,
        string | string[] | undefined
    >
): TransactionFilters {
    const range = z.enum(RANGES).safeParse(
        search.range
    );

    const type = z.enum(TYPES).safeParse(
        search.type
    );

    const category = z.enum(CATEGORIES).safeParse(
        search.category
    );

    // Không chấp nhận từ khóa rỗng hoặc quá dài.
    const query = z
        .string()
        .trim()
        .min(1)
        .max(120)
        .safeParse(search.q);

    return {
        range: range.success
            ? range.data
            : "this-month",

        ...(type.success
            ? { type: type.data }
            : {}),

        ...(category.success
            ? { category: category.data }
            : {}),

        ...(query.success
            ? { q: query.data }
            : {}),
    };
}
