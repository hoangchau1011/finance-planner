
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

// ==========================================
// 1. MOCK DATABASE, SESSION VÀ NEXT.JS
// ==========================================

const mocks = vi.hoisted(() => ({
    requireUser: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    revalidatePath: vi.fn(),

    UnauthorizedError: class UnauthorizedError
        extends Error { },
}));

vi.mock("@/lib/dal", () => ({
    requireUser: mocks.requireUser,
    UnauthorizedError: mocks.UnauthorizedError,
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        wishlistItem: {
            create: mocks.create,
            updateMany: mocks.updateMany,
            deleteMany: mocks.deleteMany,
        },
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

// ==========================================
// 2. IMPORT CODE CẦN KIỂM THỬ
// ==========================================

import {
    createWishlist,
    updateWishlist,
    deleteWishlist,
} from "@/app/wishlist/actions";

import {
    wishlistSchema,
    wishlistIdSchema,
    readWishlistValues,
} from "@/lib/wishlist-validation";

// ==========================================
// 3. DỮ LIỆU MẪU
// ==========================================

const USER_A = "user-a";
const USER_B = "user-b";

function makeFormData(
    overrides: Partial<{
        name: string;
        cost: string;
        priority: string;
    }> = {},
) {
    const values = {
        name: "Mua laptop",
        cost: "15000000",
        priority: "HIGH",
        ...overrides,
    };

    const formData = new FormData();

    formData.set("name", values.name);
    formData.set("cost", values.cost);
    formData.set("priority", values.priority);

    return formData;
}

// ==========================================
// 4. THIẾT LẬP TRƯỚC MỖI TEST
// ==========================================

beforeEach(() => {
    vi.clearAllMocks();

    // Mặc định: user A đang đăng nhập.
    mocks.requireUser.mockResolvedValue({
        id: USER_A,
        name: "User A",
    });

    mocks.create.mockResolvedValue({
        id: "wishlist-1",
    });

    mocks.updateMany.mockResolvedValue({
        count: 1,
    });

    mocks.deleteMany.mockResolvedValue({
        count: 1,
    });
});

// ==========================================
// TEST GROUP 1 - ZOD VALIDATION
// ==========================================

describe("Wishlist - Zod Validation", () => {
    it("Chấp nhận dữ liệu hợp lệ", () => {
        const result = wishlistSchema.safeParse({
            name: "Mua laptop",
            cost: "15000000",
            priority: "HIGH",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.cost).toBe(15000000);
            expect(result.data.priority).toBe("HIGH");
        }
    });

    it("Tự loại bỏ khoảng trắng của tên", () => {
        const result = wishlistSchema.safeParse({
            name: "  Mua laptop  ",
            cost: "15000000",
            priority: "MEDIUM",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.name).toBe("Mua laptop");
        }
    });

    it("Từ chối tên mục tiêu rỗng", () => {
        const result = wishlistSchema.safeParse({
            name: "   ",
            cost: "5000000",
            priority: "LOW",
        });

        expect(result.success).toBe(false);
    });

    it("Từ chối tên dài hơn 100 ký tự", () => {
        const result = wishlistSchema.safeParse({
            name: "A".repeat(101),
            cost: "5000000",
            priority: "LOW",
        });

        expect(result.success).toBe(false);
    });

    it("Từ chối số tiền bằng 0 hoặc âm", () => {
        for (const cost of ["0", "-100000"]) {
            const result = wishlistSchema.safeParse({
                name: "Mua violin",
                cost,
                priority: "HIGH",
            });

            expect(result.success).toBe(false);
        }
    });

    it("Từ chối số tiền không phải số nguyên", () => {
        for (const cost of [
            "100.5",
            "abc",
            "",
            "3000000000",
        ]) {
            const result = wishlistSchema.safeParse({
                name: "Mua violin",
                cost,
                priority: "HIGH",
            });

            expect(result.success).toBe(false);
        }
    });

    it("Từ chối mức ưu tiên không hợp lệ", () => {
        const result = wishlistSchema.safeParse({
            name: "Mua laptop",
            cost: "15000000",
            priority: "URGENT",
        });

        expect(result.success).toBe(false);
    });

    it("Kiểm tra ID mục tiêu", () => {
        expect(
            wishlistIdSchema.safeParse("wishlist-1").success
        ).toBe(true);

        expect(
            wishlistIdSchema.safeParse("   ").success
        ).toBe(false);
    });

    it("Đọc FormData đúng cấu trúc", () => {
        const values = readWishlistValues(
            makeFormData()
        );

        expect(values).toEqual({
            name: "Mua laptop",
            cost: "15000000",
            priority: "HIGH",
        });
    });
});

// ==========================================
// TEST GROUP 2 - CREATE WISHLIST
// ==========================================

describe("Wishlist - Create", () => {
    it("Tạo mục tiêu cho user đang đăng nhập", async () => {
        const result = await createWishlist(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(true);

        expect(mocks.create).toHaveBeenCalledWith({
            data: {
                name: "Mua laptop",
                cost: 15000000,
                priority: "HIGH",
                userId: USER_A,
            },
        });

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/wishlist");

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/dashboard");
    });

    it("Không cho phép giả mạo userId", async () => {
        const formData = makeFormData();

        // Giả lập người dùng cố gửi ID tài khoản khác.
        formData.set("userId", USER_B);

        const result = await createWishlist(
            {},
            formData
        );

        expect(result.ok).toBe(true);

        // Server phải lấy userId từ session.
        expect(mocks.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: USER_A,
            }),
        });
    });

    it("Không lưu dữ liệu sai", async () => {
        const result = await createWishlist(
            {},
            makeFormData({
                name: "",
                cost: "-100",
            })
        );

        expect(result.ok).toBe(false);
        expect(result.errors?.name).toBeDefined();
        expect(result.errors?.cost).toBeDefined();

        expect(mocks.create).not.toHaveBeenCalled();
    });

    it("Không cho phép tạo khi chưa đăng nhập", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new mocks.UnauthorizedError()
        );

        const result = await createWishlist(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.create).not.toHaveBeenCalled();
    });

    it("Xử lý lỗi database khi tạo", async () => {
        mocks.create.mockRejectedValueOnce(
            new Error("Database error")
        );

        const result = await createWishlist(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });
});

// ==========================================
// TEST GROUP 3 - UPDATE WISHLIST
// ==========================================

describe("Wishlist - Update", () => {
    it("Cập nhật mục tiêu thuộc user hiện tại", async () => {
        const result = await updateWishlist(
            "wishlist-1",
            {},
            makeFormData({
                name: "Mua laptop mới",
                cost: "18000000",
            })
        );

        expect(result.ok).toBe(true);

        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: {
                id: "wishlist-1",
                userId: USER_A,
            },
            data: {
                name: "Mua laptop mới",
                cost: 18000000,
                priority: "HIGH",
            },
        });
    });

    it("Không cập nhật mục tiêu của user khác", async () => {
        // Giả lập ID thuộc user B.
        mocks.updateMany.mockResolvedValueOnce({
            count: 0,
        });

        const result = await updateWishlist(
            "wishlist-cua-user-b",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: {
                id: "wishlist-cua-user-b",
                userId: USER_A,
            },
            data: expect.any(Object),
        });

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("Từ chối ID không hợp lệ", async () => {
        const result = await updateWishlist(
            "   ",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.updateMany)
            .not.toHaveBeenCalled();
    });

    it("Không cập nhật khi mất session", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new mocks.UnauthorizedError()
        );

        const result = await updateWishlist(
            "wishlist-1",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.updateMany)
            .not.toHaveBeenCalled();
    });
});

// ==========================================
// TEST GROUP 4 - DELETE WISHLIST
// ==========================================

describe("Wishlist - Delete", () => {
    it("Xóa mục tiêu của user hiện tại", async () => {
        const result = await deleteWishlist(
            "wishlist-1"
        );

        expect(result.ok).toBe(true);

        expect(mocks.deleteMany).toHaveBeenCalledWith({
            where: {
                id: "wishlist-1",
                userId: USER_A,
            },
        });

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/wishlist");
    });

    it("Không xóa mục tiêu của user khác", async () => {
        mocks.deleteMany.mockResolvedValueOnce({
            count: 0,
        });

        const result = await deleteWishlist(
            "wishlist-cua-user-b"
        );

        expect(result.ok).toBe(false);

        expect(mocks.deleteMany).toHaveBeenCalledWith({
            where: {
                id: "wishlist-cua-user-b",
                userId: USER_A,
            },
        });

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("Không xóa khi chưa đăng nhập", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new mocks.UnauthorizedError()
        );

        const result = await deleteWishlist(
            "wishlist-1"
        );

        expect(result.ok).toBe(false);

        expect(mocks.deleteMany)
            .not.toHaveBeenCalled();
    });

    it("Từ chối ID xóa không hợp lệ", async () => {
        const result = await deleteWishlist("");

        expect(result.ok).toBe(false);

        expect(mocks.deleteMany)
            .not.toHaveBeenCalled();
    });

    it("Xử lý lỗi database khi xóa", async () => {
        mocks.deleteMany.mockRejectedValueOnce(
            new Error("Database error")
        );

        const result = await deleteWishlist(
            "wishlist-1"
        );

        expect(result.ok).toBe(false);

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });
});
