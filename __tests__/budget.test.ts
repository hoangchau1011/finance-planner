
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

// ==========================================
// 1. MOCK PRISMA, SESSION VÀ NEXT.JS
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
        monthlyBudget: {
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
    createBudget,
    updateBudget,
    deleteBudget,
} from "@/app/budgets/actions";

import {
    budgetSchema,
    budgetMonthSchema,
    budgetIdSchema,
    readBudgetValues,
    BUDGET_CATEGORIES,
} from "@/lib/budget-validation";

// ==========================================
// 3. DỮ LIỆU KIỂM THỬ
// ==========================================

const USER_A = "user-a";
const USER_B = "user-b";

function makeFormData(
    overrides: Partial<{
        month: string;
        category: string;
        limitAmount: string;
    }> = {},
): FormData {
    const values = {
        month: "2026-11",
        category: "FOOD",
        limitAmount: "2000000",
        ...overrides,
    };

    const formData = new FormData();

    formData.set("month", values.month);
    formData.set("category", values.category);
    formData.set("limitAmount", values.limitAmount);

    return formData;
}

// ==========================================
// 4. THIẾT LẬP TRƯỚC MỖI TEST
// ==========================================

beforeEach(() => {
    vi.resetAllMocks();

    // Mặc định user A đang đăng nhập.
    mocks.requireUser.mockResolvedValue({
        id: USER_A,
        name: "User A",
    });

    mocks.create.mockResolvedValue({
        id: "budget-1",
    });

    mocks.updateMany.mockResolvedValue({
        count: 1,
    });

    mocks.deleteMany.mockResolvedValue({
        count: 1,
    });
});

// ==========================================
// GROUP 1 - BUDGET VALIDATION
// ==========================================

describe("Budget - Zod Validation", () => {
    it("Chấp nhận ngân sách hợp lệ", () => {
        const result = budgetSchema.safeParse({
            month: "2026-11",
            category: "FOOD",
            limitAmount: "2000000",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data).toEqual({
                month: "2026-11",
                category: "FOOD",
                limitAmount: 2000000,
            });
        }
    });

    it("Tự loại bỏ khoảng trắng", () => {
        const result = budgetSchema.safeParse({
            month: " 2026-11 ",
            category: "FOOD",
            limitAmount: " 2000000 ",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.month).toBe("2026-11");
            expect(result.data.limitAmount).toBe(2000000);
        }
    });

    it("Từ chối tháng không hợp lệ", () => {
        const invalidMonths = [
            "2026-00",
            "2026-13",
            "2026-1",
            "26-11",
            "2026/11",
            "",
        ];

        for (const month of invalidMonths) {
            expect(
                budgetMonthSchema.safeParse(month).success
            ).toBe(false);
        }
    });

    it("Từ chối danh mục thu nhập và danh mục lạ", () => {
        expect(
            BUDGET_CATEGORIES.includes("FOOD")
        ).toBe(true);

        for (const category of ["SALARY", "INVALID"]) {
            const result = budgetSchema.safeParse({
                month: "2026-11",
                category,
                limitAmount: "2000000",
            });

            expect(result.success).toBe(false);
        }
    });

    it("Từ chối hạn mức bằng 0 hoặc âm", () => {
        for (const limitAmount of ["0", "-100000"]) {
            const result = budgetSchema.safeParse({
                month: "2026-11",
                category: "FOOD",
                limitAmount,
            });

            expect(result.success).toBe(false);
        }
    });

    it("Từ chối hạn mức không phải số nguyên hợp lệ", () => {
        const invalidAmounts = [
            "100.5",
            "abc",
            "",
            "3000000000",
        ];

        for (const limitAmount of invalidAmounts) {
            const result = budgetSchema.safeParse({
                month: "2026-11",
                category: "FOOD",
                limitAmount,
            });

            expect(result.success).toBe(false);
        }
    });

    it("Chấp nhận hạn mức tối đa của Prisma Int", () => {
        const result = budgetSchema.safeParse({
            month: "2026-11",
            category: "FOOD",
            limitAmount: "2147483647",
        });

        expect(result.success).toBe(true);
    });

    it("Kiểm tra ID ngân sách", () => {
        expect(
            budgetIdSchema.safeParse("budget-1").success
        ).toBe(true);

        expect(
            budgetIdSchema.safeParse("   ").success
        ).toBe(false);

        expect(
            budgetIdSchema.safeParse("a".repeat(192))
                .success
        ).toBe(false);
    });

    it("Đọc FormData đúng cấu trúc", () => {
        const values = readBudgetValues(
            makeFormData()
        );

        expect(values).toEqual({
            month: "2026-11",
            category: "FOOD",
            limitAmount: "2000000",
        });
    });
});

// ==========================================
// GROUP 2 - CREATE BUDGET
// ==========================================

describe("Budget - Create", () => {
    it("Tạo ngân sách cho user đang đăng nhập", async () => {
        const result = await createBudget(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(true);

        expect(mocks.create).toHaveBeenCalledWith({
            data: {
                month: "2026-11",
                category: "FOOD",
                limitAmount: 2000000,
                userId: USER_A,
            },
        });

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/budgets");

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/dashboard");

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/reports");
    });

    it("Không cho phép giả mạo userId", async () => {
        const formData = makeFormData();

        // Giả lập người dùng gửi userId khác.
        formData.set("userId", USER_B);

        const result = await createBudget(
            {},
            formData
        );

        expect(result.ok).toBe(true);

        expect(mocks.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: USER_A,
            }),
        });
    });

    it("Không lưu dữ liệu không hợp lệ", async () => {
        const result = await createBudget(
            {},
            makeFormData({
                month: "2026-15",
                limitAmount: "-100",
            })
        );

        expect(result.ok).toBe(false);
        expect(result.errors?.month).toBeDefined();
        expect(result.errors?.limitAmount).toBeDefined();

        expect(mocks.create)
            .not.toHaveBeenCalled();
    });

    it("Không tạo ngân sách khi chưa đăng nhập", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new mocks.UnauthorizedError()
        );

        const result = await createBudget(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.create)
            .not.toHaveBeenCalled();
    });

    it("Xử lý ngân sách trùng P2002", async () => {
        mocks.create.mockRejectedValueOnce({
            code: "P2002",
        });

        const result = await createBudget(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);
        expect(result.message).toContain(
            "đã có ngân sách"
        );

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("Xử lý lỗi database khi tạo", async () => {
        mocks.create.mockRejectedValueOnce(
            new Error("Database error")
        );

        const result = await createBudget(
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });
});

// ==========================================
// GROUP 3 - UPDATE BUDGET
// ==========================================

describe("Budget - Update", () => {
    it("Cập nhật ngân sách của user hiện tại", async () => {
        const result = await updateBudget(
            "budget-1",
            {},
            makeFormData({
                limitAmount: "3000000",
            })
        );

        expect(result.ok).toBe(true);

        expect(mocks.updateMany)
            .toHaveBeenCalledWith({
                where: {
                    id: "budget-1",
                    userId: USER_A,
                },

                data: {
                    month: "2026-11",
                    category: "FOOD",
                    limitAmount: 3000000,
                },
            });

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/budgets");
    });

    it("Không sửa ngân sách của user khác", async () => {
        mocks.updateMany.mockResolvedValueOnce({
            count: 0,
        });

        const result = await updateBudget(
            "budget-cua-user-b",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.updateMany)
            .toHaveBeenCalledWith({
                where: {
                    id: "budget-cua-user-b",
                    userId: USER_A,
                },
                data: expect.any(Object),
            });

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("Từ chối ID ngân sách không hợp lệ", async () => {
        const result = await updateBudget(
            "   ",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.updateMany)
            .not.toHaveBeenCalled();
    });

    it("Không cập nhật dữ liệu sai", async () => {
        const result = await updateBudget(
            "budget-1",
            {},
            makeFormData({
                limitAmount: "0",
            })
        );

        expect(result.ok).toBe(false);
        expect(result.errors?.limitAmount).toBeDefined();

        expect(mocks.updateMany)
            .not.toHaveBeenCalled();
    });

    it("Xử lý trùng ngân sách khi sửa", async () => {
        mocks.updateMany.mockRejectedValueOnce({
            code: "P2002",
        });

        const result = await updateBudget(
            "budget-1",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);
        expect(result.message).toContain(
            "đã có ngân sách"
        );
    });

    it("Không cập nhật khi mất session", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new mocks.UnauthorizedError()
        );

        const result = await updateBudget(
            "budget-1",
            {},
            makeFormData()
        );

        expect(result.ok).toBe(false);

        expect(mocks.updateMany)
            .not.toHaveBeenCalled();
    });
});

// ==========================================
// GROUP 4 - DELETE BUDGET
// ==========================================

describe("Budget - Delete", () => {
    it("Xóa ngân sách của user hiện tại", async () => {
        const result = await deleteBudget(
            "budget-1"
        );

        expect(result.ok).toBe(true);

        expect(mocks.deleteMany)
            .toHaveBeenCalledWith({
                where: {
                    id: "budget-1",
                    userId: USER_A,
                },
            });

        expect(mocks.revalidatePath)
            .toHaveBeenCalledWith("/budgets");
    });

    it("Không xóa ngân sách của user khác", async () => {
        mocks.deleteMany.mockResolvedValueOnce({
            count: 0,
        });

        const result = await deleteBudget(
            "budget-cua-user-b"
        );

        expect(result.ok).toBe(false);

        expect(mocks.deleteMany)
            .toHaveBeenCalledWith({
                where: {
                    id: "budget-cua-user-b",
                    userId: USER_A,
                },
            });

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("Từ chối ID xóa không hợp lệ", async () => {
        const result = await deleteBudget("");

        expect(result.ok).toBe(false);

        expect(mocks.deleteMany)
            .not.toHaveBeenCalled();
    });

    it("Không xóa khi chưa đăng nhập", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new mocks.UnauthorizedError()
        );

        const result = await deleteBudget(
            "budget-1"
        );

        expect(result.ok).toBe(false);

        expect(mocks.deleteMany)
            .not.toHaveBeenCalled();
    });

    it("Xử lý lỗi database khi xóa", async () => {
        mocks.deleteMany.mockRejectedValueOnce(
            new Error("Database error")
        );

        const result = await deleteBudget(
            "budget-1"
        );

        expect(result.ok).toBe(false);

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });
});
