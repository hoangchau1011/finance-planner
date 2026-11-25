
"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/dal";

import {
    readWishlistValues,
    wishlistIdSchema,
    wishlistSchema,
    type WishlistFormState,
} from "@/lib/wishlist-validation";

// ==========================================
// V1.0 - WISHLIST SERVER ACTIONS
// ==========================================

const SESSION_EXPIRED_MESSAGE =
    "Bạn cần đăng nhập để quản lý Wishlist.";

const WISHLIST_NOT_FOUND_MESSAGE =
    "Không tìm thấy mục tiêu hoặc bạn không có quyền thao tác.";

// ==========================================
// 1. KIỂM TRA SESSION BETTER AUTH
// ==========================================

async function getAuthenticatedUserId(): Promise<string | null> {
    try {
        const user = await requireUser();

        // userId chỉ được lấy từ session Better Auth.
        return user.id;
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return null;
        }

        // Không che giấu các lỗi hệ thống khác.
        throw error;
    }
}

// ==========================================
// 2. CẬP NHẬT GIAO DIỆN SAU CRUD
// ==========================================

function revalidateWishlistPages() {
    revalidatePath("/wishlist");
    revalidatePath("/dashboard");
}

// ==========================================
// 3. HÀM DÙNG CHUNG CHO THÊM VÀ SỬA
// ==========================================

async function saveWishlist(
    kind: "create" | "update",
    formData: FormData,
    id?: string,
): Promise<WishlistFormState> {
    // Bước 1: Kiểm tra đăng nhập.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    // Bước 2: Đọc dữ liệu từ form.
    const values = readWishlistValues(formData);

    // Bước 3: Kiểm tra bằng Zod 4.
    const parsed = wishlistSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Vui lòng kiểm tra lại thông tin mục tiêu.",
            errors: z.flattenError(parsed.error).fieldErrors,
            values,
        };
    }

    // Bước 4: Kiểm tra ID khi cập nhật.
    if (
        kind === "update" &&
        !wishlistIdSchema.safeParse(id).success
    ) {
        return {
            ok: false,
            message: "ID mục tiêu không hợp lệ.",
            values,
        };
    }

    // Dữ liệu đã được Zod kiểm tra:
    // name: string
    // cost: number
    // priority: LOW | MEDIUM | HIGH
    const data = parsed.data;

    // Bước 5: Thực hiện thao tác với Prisma.
    try {
        if (kind === "create") {
            // THÊM WISHLIST
            await prisma.wishlistItem.create({
                data: {
                    ...data,
                    userId,
                },
            });
        } else {
            // SỬA WISHLIST
            // Chỉ sửa mục tiêu thuộc tài khoản đang đăng nhập.
            const result = await prisma.wishlistItem.updateMany({
                where: {
                    id: id!,
                    userId,
                },
                data,
            });

            if (result.count !== 1) {
                return {
                    ok: false,
                    message: WISHLIST_NOT_FOUND_MESSAGE,
                    values,
                };
            }
        }
    } catch {
        return {
            ok: false,
            message: "Không thể lưu mục tiêu. Vui lòng thử lại.",
            values,
        };
    }

    // Bước 6: Cập nhật Dashboard và Wishlist.
    revalidateWishlistPages();

    return {
        ok: true,
        message:
            kind === "create"
                ? "Đã thêm mục tiêu thành công."
                : "Đã cập nhật mục tiêu thành công.",
    };
}

// ==========================================
// 4. SERVER ACTION - THÊM WISHLIST
// ==========================================

export async function createWishlist(
    _previous: WishlistFormState,
    formData: FormData,
): Promise<WishlistFormState> {
    return saveWishlist("create", formData);
}

// ==========================================
// 5. SERVER ACTION - SỬA WISHLIST
// ==========================================

export async function updateWishlist(
    id: string,
    _previous: WishlistFormState,
    formData: FormData,
): Promise<WishlistFormState> {
    return saveWishlist("update", formData, id);
}

// ==========================================
// 6. SERVER ACTION - XÓA WISHLIST
// ==========================================

export async function deleteWishlist(
    id: string,
): Promise<{ ok: boolean; message: string }> {
    // Kiểm tra session.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
        return {
            ok: false,
            message: SESSION_EXPIRED_MESSAGE,
        };
    }

    // Kiểm tra ID đầu vào.
    if (!wishlistIdSchema.safeParse(id).success) {
        return {
            ok: false,
            message: "ID mục tiêu không hợp lệ.",
        };
    }

    try {
        // Chỉ xóa mục tiêu thuộc user hiện tại.
        const result = await prisma.wishlistItem.deleteMany({
            where: {
                id,
                userId,
            },
        });

        if (result.count !== 1) {
            return {
                ok: false,
                message: WISHLIST_NOT_FOUND_MESSAGE,
            };
        }
    } catch {
        return {
            ok: false,
            message: "Không thể xóa mục tiêu. Vui lòng thử lại.",
        };
    }

    revalidateWishlistPages();

    return {
        ok: true,
        message: "Đã xóa mục tiêu thành công.",
    };
}
