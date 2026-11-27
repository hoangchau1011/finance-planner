
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

// ==========================================
// FINANCE PLANNER V1.0
// SIMULATOR PAGE - SECURITY TESTS
// ==========================================

// Các hàm giả lập để không truy cập Neon.
const mocks = vi.hoisted(() => ({
    requireUser: vi.fn(),
    redirect: vi.fn(),
    wishlistFindMany: vi.fn(),
    transactionFindMany: vi.fn(),
    getRecentCashFlowAverage: vi.fn(),
}));

// ==========================================
// 1. MOCK XÁC THỰC
// ==========================================

vi.mock("@/lib/dal", () => ({
    UnauthorizedError: class UnauthorizedError
        extends Error {
        constructor() {
            super("Bạn cần đăng nhập.");
            this.name = "UnauthorizedError";
        }
    },

    requireUser: mocks.requireUser,
}));

// ==========================================
// 2. MOCK DATABASE
// ==========================================

vi.mock("@/lib/prisma", () => ({
    prisma: {
        wishlistItem: {
            findMany: mocks.wishlistFindMany,
        },

        transaction: {
            findMany: mocks.transactionFindMany,
        },
    },
}));

// ==========================================
// 3. MOCK NEXT.JS REDIRECT
// ==========================================

vi.mock("next/navigation", () => ({
    redirect: mocks.redirect,
}));

vi.mock("next/link", () => ({
    default: () => null,
}));

// ==========================================
// 4. MOCK KHOẢNG THỜI GIAN
// ==========================================

vi.mock("@/lib/finance", () => ({
    getVietnamMonthRange: (
        _date: Date,
        offset = 0
    ) => ({
        gte: new Date(
            offset === -3
                ? "2026-07-31T17:00:00.000Z"
                : "2026-10-31T17:00:00.000Z"
        ),
    }),
}));

// ==========================================
// 5. MOCK BỘ TÍNH TOÁN VÀ GIAO DIỆN
// ==========================================

vi.mock("@/lib/financial-simulator", () => ({
    getRecentCashFlowAverage:
        mocks.getRecentCashFlowAverage,
}));

vi.mock(
    "@/components/financial-simulator",
    () => ({
        FinancialSimulator: () => null,
    })
);

// ==========================================
// 6. IMPORT TRANG CẦN KIỂM THỬ
// ==========================================

import SimulatorPage from "@/app/simulator/page";

import {
    UnauthorizedError,
} from "@/lib/dal";

// ==========================================
// 7. DỮ LIỆU THỬ
// ==========================================

const exampleGoals = [
    {
        id: "goal-1",
        name: "Mua laptop",
        cost: 15_000_000,
        savedAmount: 6_000_000,
    },
];

const exampleTransactions = [
    {
        type: "INCOME" as const,
        amount: 12_000_000,
        date: new Date(
            "2026-10-10T03:00:00.000Z"
        ),
    },
    {
        type: "EXPENSE" as const,
        amount: 5_000_000,
        date: new Date(
            "2026-10-15T03:00:00.000Z"
        ),
    },
];

const exampleCashFlow = {
    months: [],
    averageIncome: 4_000_000,
    averageExpense: 1_666_667,
    averageAvailable: 2_333_333,
};

// ==========================================
// 8. THIẾT LẬP TRƯỚC MỖI TEST
// ==========================================

beforeEach(() => {
    vi.clearAllMocks();

    mocks.requireUser.mockResolvedValue({
        id: "user-a",
    });

    mocks.wishlistFindMany.mockResolvedValue(
        exampleGoals
    );

    mocks.transactionFindMany.mockResolvedValue(
        exampleTransactions
    );

    mocks.getRecentCashFlowAverage.mockReturnValue(
        exampleCashFlow
    );

    // Mô phỏng cách redirect của Next.js
    // kết thúc quá trình render bằng exception.
    mocks.redirect.mockImplementation(() => {
        throw new Error("TEST_REDIRECT");
    });
});

// ==========================================
// GROUP 1 - XÁC THỰC
// ==========================================

describe("Simulator Page - Authentication", () => {
    it("Chưa đăng nhập thì chuyển đến /login", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new UnauthorizedError()
        );

        await expect(
            SimulatorPage()
        ).rejects.toThrow("TEST_REDIRECT");

        expect(mocks.redirect).toHaveBeenCalledWith(
            "/login"
        );
    });

    it("Không truy vấn Neon nếu chưa đăng nhập", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new UnauthorizedError()
        );

        await expect(
            SimulatorPage()
        ).rejects.toThrow("TEST_REDIRECT");

        expect(
            mocks.wishlistFindMany
        ).not.toHaveBeenCalled();

        expect(
            mocks.transactionFindMany
        ).not.toHaveBeenCalled();
    });

    it("Không che giấu lỗi hệ thống thành lỗi đăng nhập", async () => {
        mocks.requireUser.mockRejectedValueOnce(
            new Error("Session service error")
        );

        await expect(
            SimulatorPage()
        ).rejects.toThrow("Session service error");

        expect(
            mocks.redirect
        ).not.toHaveBeenCalled();
    });
});

// ==========================================
// GROUP 2 - PHÂN QUYỀN DỮ LIỆU
// ==========================================

describe("Simulator Page - Authorization", () => {
    it("Chỉ truy vấn Wishlist của user đang đăng nhập", async () => {
        await SimulatorPage();

        expect(
            mocks.wishlistFindMany
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    userId: "user-a",
                },
                select: expect.objectContaining({
                    id: true,
                    name: true,
                    cost: true,
                    savedAmount: true,
                }),
            })
        );
    });

    it("Chỉ truy vấn giao dịch của user đang đăng nhập", async () => {
        await SimulatorPage();

        expect(
            mocks.transactionFindMany
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: "user-a",
                }),
                select: expect.objectContaining({
                    type: true,
                    amount: true,
                    date: true,
                }),
            })
        );
    });

    it("Đổi tài khoản thì truy vấn bằng userId mới", async () => {
        await SimulatorPage();

        mocks.requireUser.mockResolvedValueOnce({
            id: "user-b",
        });

        await SimulatorPage();

        expect(
            mocks.wishlistFindMany
        ).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: {
                    userId: "user-b",
                },
            })
        );

        expect(
            mocks.transactionFindMany
        ).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: "user-b",
                }),
            })
        );
    });
});

// ==========================================
// GROUP 3 - DỮ LIỆU MÔ PHỎNG
// ==========================================

describe("Simulator Page - Data Integration", () => {
    it("Chỉ lấy giao dịch của 3 tháng hoàn thành", async () => {
        await SimulatorPage();

        expect(
            mocks.transactionFindMany
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    date: {
                        gte: new Date(
                            "2026-07-31T17:00:00.000Z"
                        ),
                        lt: new Date(
                            "2026-10-31T17:00:00.000Z"
                        ),
                    },
                }),
            })
        );
    });

    it("Truyền giao dịch vào bộ phân tích với 3 tháng", async () => {
        await SimulatorPage();

        expect(
            mocks.getRecentCashFlowAverage
        ).toHaveBeenCalledWith(
            exampleTransactions,
            expect.any(Date),
            3
        );
    });

    it("Vẫn render được khi người dùng chưa có Wishlist", async () => {
        mocks.wishlistFindMany.mockResolvedValueOnce(
            []
        );

        const page = await SimulatorPage();

        expect(page).toBeDefined();

        expect(
            mocks.wishlistFindMany
        ).toHaveBeenCalledTimes(1);
    });
});
