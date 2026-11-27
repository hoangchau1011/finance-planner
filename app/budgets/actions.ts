
"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
    requireUser,
    UnauthorizedError,
} from "@/lib/dal";

import {
    budgetSchema,
    budgetIdSchema,
    readBudgetValues,
    type BudgetFormState,
} from "@/lib/budget-validation";

// ==========================================
// FINANCE PLANNER V1.0 - BUDGET ACTIONS
// ==========================================

const SESSION_EXPIRED_MESSAGE =
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

const BUDGET_NOT_FOUND_MESSAGE =
    "Không tìm thấy ngân sách hoặc bạn không có quyền thao tác.";

const DUPLICATE_BUDGET_MESSAGE =
    "Danh mục này đã có ngân sách trong tháng được chọn.";

// ==========================================
// 1. KIỂM TRA SESSION BETTER AUTH
// ==========================================

async function getAuthenticatedUserId():
    Promise<string | null> {
    try {
        const user = await requireUser();

        // Không lấy userId từ FormData.
        return user.id;
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return null;
        }

        throw error;
    }
}

// ==========================================
// 2. KIỂM TRA LỖI TRÙNG NGÂN SÁCH
// ==========================================

// Prisma trả mã P2002 khi vi phạm
// ràng buộc UNIQUE trong database.
function isUniqueConstraintError(
    error: unknown
): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

// ==========================================
// 3. CẬP NHẬT CÁC TRANG SAU CRUD
// ==========================================

function revalidateBudgetPages() {
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
}

// ==========================================
// 4. HÀM DÙNG CHUNG CHO THÊM / SỬA
// ==========================================

async function saveBudget(
    kind: "create" | "update",
    formData: FormData,
    id?: string
): Promise<BudgetFormState> {

    // BƯỚC 1: Kiểm tra đăng nhập.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    // BƯỚC 2: Đọc dữ liệu từ form.
    const values = readBudgetValues(formData);

    // BƯỚC 3: Kiểm tra bằng Zod 4.
    const parsed = budgetSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Vui lòng kiểm tra lại thông tin ngân sách.",
            errors: z.flattenError(
                parsed.error
            ).fieldErrors,
            values,
        };
    }

    // BƯỚC 4: Lưu vào database.
    try {
        if (kind === "create") {

            // THÊM NGÂN SÁCH
            await prisma.monthlyBudget.create({
                data: {
                    ...parsed.data,
                    userId,
                },
            });

        } else {

            // SỬA NGÂN SÁCH
            const parsedId =
                budgetIdSchema.safeParse(id);

            if (!parsedId.success) {
                return {
                    ok: false,
                    message: "ID ngân sách không hợp lệ.",
                    values,
                };
            }

            // Không cho sửa ngân sách của user khác.
            const result =
                await prisma.monthlyBudget.updateMany({
                    where: {
                        id: parsedId.data,
                        userId,
                    },

                    data: {
                        month: parsed.data.month,
                        category: parsed.data.category,
                        limitAmount:
                            parsed.data.limitAmount,
                    },
                });

            if (result.count !== 1) {
                return {
                    ok: false,
                    message: BUDGET_NOT_FOUND_MESSAGE,
                    values,
                };
            }
        }

    } catch (error) {

        // Ngăn trùng danh mục trong cùng tháng.
        if (isUniqueConstraintError(error)) {
            return {
                ok: false,
                message: DUPLICATE_BUDGET_MESSAGE,
                values,
            };
        }

        return {
            ok: false,
            message:
                "Không thể lưu ngân sách. Vui lòng thử lại.",
            values,
        };
    }

    // BƯỚC 5: Cập nhật giao diện.
    revalidateBudgetPages();

    return {
        ok: true,
        message:
            kind === "create"
                ? "Đã thêm ngân sách thành công."
                : "Đã cập nhật ngân sách thành công.",
    };
}

// ==========================================
// 5. SERVER ACTION - THÊM NGÂN SÁCH
// ==========================================

export async function createBudget(
    _previous: BudgetFormState,
    formData: FormData
): Promise<BudgetFormState> {
    return saveBudget("create", formData);
}

// ==========================================
// 6. SERVER ACTION - SỬA NGÂN SÁCH
// ==========================================

export async function updateBudget(
    id: string,
    _previous: BudgetFormState,
    formData: FormData
): Promise<BudgetFormState> {
    return saveBudget("update", formData, id);
}

// ==========================================
// 7. SERVER ACTION - XÓA NGÂN SÁCH
// ==========================================

export async function deleteBudget(
    id: string
): Promise<{
    ok: boolean;
    message: string;
}> {

    // BƯỚC 1: Kiểm tra đăng nhập.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    // BƯỚC 2: Kiểm tra ID.
    const parsedId = budgetIdSchema.safeParse(id);

    if (!parsedId.success) {
        return {
            ok: false,
            message: "ID ngân sách không hợp lệ.",
        };
    }

    // BƯỚC 3: Xóa dữ liệu thuộc user hiện tại.
    try {
        const result =
            await prisma.monthlyBudget.deleteMany({
                where: {
                    id: parsedId.data,
                    userId,
                },
            });

        if (result.count !== 1) {
            return {
                ok: false,
                message: BUDGET_NOT_FOUND_MESSAGE,
            };
        }

    } catch {
        return {
            ok: false,
            message:
                "Không thể xóa ngân sách. Vui lòng thử lại.",
        };
    }

    // BƯỚC 4: Cập nhật giao diện.
    revalidateBudgetPages();

    return {
        ok: true,
        message: "Đã xóa ngân sách thành công.",
    };
}
