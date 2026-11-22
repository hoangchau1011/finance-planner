
"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/dal";

import {
    readTransactionValues,
    transactionIdSchema,
    transactionSchema,
    type TransactionFormState,
} from "@/lib/validation";

// ==========================================
// FP3 - THÔNG BÁO BẢO MẬT
// ==========================================

const SESSION_EXPIRED_MESSAGE =
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

const TRANSACTION_NOT_FOUND_MESSAGE =
    "Giao dịch không tồn tại hoặc bạn không có quyền thao tác.";

// ==========================================
// FP3 - KIỂM TRA SESSION
// ==========================================

// Chỉ lấy userId từ Better Auth session.
// Tuyệt đối không lấy userId từ FormData hoặc client.
async function getAuthenticatedUserId(): Promise<string | null> {
    try {
        const user = await requireUser();
        return user.id;
    } catch (error) {
        // Người dùng chưa đăng nhập hoặc session đã hết hạn.
        if (error instanceof UnauthorizedError) {
            return null;
        }

        // Lỗi hệ thống khác không được giả thành lỗi đăng nhập.
        throw error;
    }
}

// ==========================================
// CẬP NHẬT DỮ LIỆU SAU CRUD
// ==========================================

function revalidateFinancePages() {
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
}

// ==========================================
// HÀM LƯU GIAO DỊCH DÙNG CHUNG
// ==========================================

async function saveTransaction(
    kind: "create" | "update",
    _previous: TransactionFormState,
    formData: FormData,
    userId: string,
    id?: string,
): Promise<TransactionFormState> {
    const values = readTransactionValues(formData);

    // Kiểm tra dữ liệu đầu vào bằng Zod.
    const parsed = transactionSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Vui lòng kiểm tra các trường được đánh dấu.",
            errors: z.flattenError(parsed.error).fieldErrors,
            values,
        };
    }

    // Kiểm tra ID khi sửa giao dịch.
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

    // Dữ liệu đã qua xác thực Zod.
    const data = {
        ...parsed.data,
        date: new Date(`${parsed.data.date}T12:00:00+07:00`),
    };

    try {
        if (kind === "create") {
            // THÊM: Gắn giao dịch với user đang đăng nhập.
            await prisma.transaction.create({
                data: {
                    ...data,
                    userId,
                },
            });
        } else {
            // SỬA: Chỉ sửa giao dịch thuộc user hiện tại.
            const result = await prisma.transaction.updateMany({
                where: {
                    id: id!,
                    userId,
                },
                data,
            });

            // Không tiết lộ giao dịch có thuộc user khác hay không.
            if (result.count !== 1) {
                return {
                    ok: false,
                    message: TRANSACTION_NOT_FOUND_MESSAGE,
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

// ==========================================
// SERVER ACTION - THÊM GIAO DỊCH
// ==========================================

export async function createTransaction(
    previous: TransactionFormState,
    formData: FormData,
): Promise<TransactionFormState> {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    return saveTransaction(
        "create",
        previous,
        formData,
        userId,
    );
}

// ==========================================
// SERVER ACTION - SỬA GIAO DỊCH
// ==========================================

export async function updateTransaction(
    id: string,
    previous: TransactionFormState,
    formData: FormData,
): Promise<TransactionFormState> {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    return saveTransaction(
        "update",
        previous,
        formData,
        userId,
        id,
    );
}

// ==========================================
// SERVER ACTION - XÓA GIAO DỊCH
// ==========================================

export async function deleteTransaction(
    id: string,
): Promise<{ ok: boolean; message: string }> {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    // Kiểm tra ID.
    if (!transactionIdSchema.safeParse(id).success) {
        return {
            ok: false,
            message: "ID giao dịch không hợp lệ.",
        };
    }

    try {
        // Chỉ xóa giao dịch thuộc tài khoản đang đăng nhập.
        const result = await prisma.transaction.deleteMany({
            where: {
                id,
                userId,
            },
        });

        if (result.count !== 1) {
            return {
                ok: false,
                message: TRANSACTION_NOT_FOUND_MESSAGE,
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
