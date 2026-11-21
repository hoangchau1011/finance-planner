
"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

import {
    readTransactionValues,
    transactionIdSchema,
    transactionSchema,
    type TransactionFormState,
} from "@/lib/validation";

// Cập nhật dữ liệu hiển thị sau khi CRUD
function revalidateFinancePages() {
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
}

// Hàm dùng chung cho thao tác thêm và sửa
async function saveTransaction(
    kind: "create" | "update",
    _previous: TransactionFormState,
    formData: FormData,
    userId: string,
    id?: string,
): Promise<TransactionFormState> {
    const values = readTransactionValues(formData);

    // Kiểm tra dữ liệu đầu vào bằng Zod 4
    const parsed = transactionSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Vui lòng kiểm tra các trường được đánh dấu.",
            errors: z.flattenError(parsed.error).fieldErrors,
            values,
        };
    }

    // Kiểm tra ID khi sửa giao dịch
    if (
        kind === "update" &&
        !transactionIdSchema.safeParse(id).success
    ) {
        return {
            ok: false,
            message: "ID giao dịch không hợp lệ.",
            values,
        };
    }

    // Chuyển dữ liệu đã được kiểm tra sang kiểu Prisma
    const data = {
        ...parsed.data,
        date: new Date(`${parsed.data.date}T12:00:00+07:00`),
    };

    try {
        if (kind === "create") {
            // THÊM GIAO DỊCH
            await prisma.transaction.create({
                data: {
                    ...data,
                    userId,
                },
            });
        } else {
            // SỬA GIAO DỊCH
            const result = await prisma.transaction.updateMany({
                where: {
                    id: id!,
                    userId,
                },
                data,
            });

            if (result.count !== 1) {
                return {
                    ok: false,
                    message:
                        "Không tìm thấy giao dịch thuộc tài khoản của bạn.",
                    values,
                };
            }
        }
    } catch {
        return {
            ok: false,
            message: "Không lưu được giao dịch. Hãy thử lại.",
            values,
        };
    }

    revalidateFinancePages();

    return {
        ok: true,
        message:
            kind === "create"
                ? "Đã thêm giao dịch."
                : "Đã cập nhật giao dịch.",
    };
}

// SERVER ACTION: Thêm giao dịch
export async function createTransaction(
    previous: TransactionFormState,
    formData: FormData,
): Promise<TransactionFormState> {
    const user = await requireUser();

    return saveTransaction(
        "create",
        previous,
        formData,
        user.id,
    );
}

// SERVER ACTION: Sửa giao dịch
export async function updateTransaction(
    id: string,
    previous: TransactionFormState,
    formData: FormData,
): Promise<TransactionFormState> {
    const user = await requireUser();

    return saveTransaction(
        "update",
        previous,
        formData,
        user.id,
        id,
    );
}

// SERVER ACTION: Xóa giao dịch
export async function deleteTransaction(
    id: string,
): Promise<{ ok: boolean; message: string }> {
    const user = await requireUser();

    if (!transactionIdSchema.safeParse(id).success) {
        return {
            ok: false,
            message: "ID giao dịch không hợp lệ.",
        };
    }

    try {
        const result = await prisma.transaction.deleteMany({
            where: {
                id,
                userId: user.id,
            },
        });

        if (result.count !== 1) {
            return {
                ok: false,
                message:
                    "Không tìm thấy giao dịch thuộc tài khoản của bạn.",
            };
        }
    } catch {
        return {
            ok: false,
            message: "Không thể xóa giao dịch. Hãy thử lại.",
        };
    }

    revalidateFinancePages();

    return {
        ok: true,
        message: "Đã xóa giao dịch.",
    };
}
