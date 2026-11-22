
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

// ==========================================
// FP3 - MOCK SESSION, PRISMA VÀ CACHE
// ==========================================

// vi.hoisted cho phép các mock được sử dụng
// trong vi.mock trước khi import module.
const mocks = vi.hoisted(() => ({
    requireUser: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/dal", () => {
    class UnauthorizedError extends Error {
        constructor() {
            super("Bạn cần đăng nhập.");
            this.name = "UnauthorizedError";
        }
    }

    return {
        requireUser: mocks.requireUser,
        UnauthorizedError,
    };
});

vi.mock("@/lib/prisma", () => ({
    prisma: {
        transaction: {
            create: mocks.create,
            updateMany: mocks.updateMany,
            deleteMany: mocks.deleteMany,
            findMany: mocks.findMany,
        },
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

// Giả lập NextResponse để test API
// mà không cần chạy Next.js server.
vi.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: ResponseInit) =>
            Response.json(body, init),
    },
}));

import {
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from "@/app/transactions/actions";

import { GET } from "@/app/api/transactions/route";
import { UnauthorizedError } from "@/lib/dal";

// ==========================================
// DỮ LIỆU GIAO DỊCH GIẢ LẬP
// ==========================================

function makeValidForm(): FormData {
    const form = new FormData();

    form.set("type", "EXPENSE");
    form.set("amount", "50000");
    form.set("description", "Giao dịch kiểm thử");
    form.set("category", "FOOD");
    form.set("date", "2026-11-22");

    return form;
}

// ==========================================
// CHUẨN BỊ TRƯỚC MỖI TEST
// ==========================================

beforeEach(() => {
    vi.resetAllMocks();

    // Mặc định giả lập tài khoản A đã đăng nhập.
    mocks.requireUser.mockResolvedValue({
        id: "user-a",
        name: "User A",
    });

    mocks.create.mockResolvedValue({
        id: "transaction-1",
    });

    mocks.updateMany.mockResolvedValue({
        count: 1,
    });

    mocks.deleteMany.mockResolvedValue({
        count: 1,
    });

    mocks.findMany.mockResolvedValue([]);
});

// ==========================================
// NHÓM 1 - CHƯA ĐĂNG NHẬP
// ==========================================

describe("FP3 - Chặn người chưa đăng nhập", () => {
    beforeEach(() => {
        mocks.requireUser.mockRejectedValue(
            new UnauthorizedError()
        );
    });

    it("1. Không được thêm giao dịch", async () => {
        const result = await createTransaction(
            {},
            makeValidForm()
        );

        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/đăng nhập/i);
        expect(mocks.create).not.toHaveBeenCalled();
    });

    it("2. Không được sửa giao dịch", async () => {
        const result = await updateTransaction(
            "transaction-1",
            {},
            makeValidForm()
        );

        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/đăng nhập/i);
        expect(mocks.updateMany).not.toHaveBeenCalled();
    });

    it("3. Không được xóa giao dịch", async () => {
        const result = await deleteTransaction(
            "transaction-1"
        );

        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/đăng nhập/i);
        expect(mocks.deleteMany).not.toHaveBeenCalled();
    });
});

// ==========================================
// NHÓM 2 - PHÂN QUYỀN THEO USER ID
// ==========================================

describe("FP3 - Bảo vệ dữ liệu theo userId", () => {
    it("4. Thêm giao dịch bằng userId của session", async () => {
        const form = makeValidForm();

        // Thử gửi thêm userId giả từ client.
        form.set("userId", "user-b");

        const result = await createTransaction({}, form);

        expect(result.ok).toBe(true);

        expect(mocks.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: "user-a",
                amount: 50000,
                type: "EXPENSE",
            }),
        });
    });

    it("5. Sửa giao dịch phải lọc theo userId", async () => {
        const result = await updateTransaction(
            "transaction-1",
            {},
            makeValidForm()
        );

        expect(result.ok).toBe(true);

        expect(mocks.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "transaction-1",
                    userId: "user-a",
                },
            })
        );
    });

    it("6. Xóa giao dịch phải lọc theo userId", async () => {
        const result = await deleteTransaction(
            "transaction-1"
        );

        expect(result.ok).toBe(true);

        expect(mocks.deleteMany).toHaveBeenCalledWith({
            where: {
                id: "transaction-1",
                userId: "user-a",
            },
        });
    });

    it("7. Không sửa được giao dịch không thuộc tài khoản", async () => {
        // Database không tìm thấy giao dịch khớp
        // cả transactionId và userId.
        mocks.updateMany.mockResolvedValue({
            count: 0,
        });

        const result = await updateTransaction(
            "transaction-of-user-b",
            {},
            makeValidForm()
        );

        expect(result.ok).toBe(false);

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("8. Không xóa được giao dịch không thuộc tài khoản", async () => {
        mocks.deleteMany.mockResolvedValue({
            count: 0,
        });

        const result = await deleteTransaction(
            "transaction-of-user-b"
        );

        expect(result.ok).toBe(false);

        expect(mocks.revalidatePath)
            .not.toHaveBeenCalled();
    });

    it("9. Dữ liệu không hợp lệ không được lưu", async () => {
        const form = makeValidForm();
        form.set("amount", "0");

        const result = await createTransaction({}, form);

        expect(result.ok).toBe(false);
        expect(mocks.create).not.toHaveBeenCalled();
    });
});

// ==========================================
// NHÓM 3 - BẢO VỆ API
// ==========================================

describe("FP3 - GET /api/transactions", () => {
    it("10. Chưa đăng nhập phải trả HTTP 401", async () => {
        mocks.requireUser.mockRejectedValue(
            new UnauthorizedError()
        );

        const request = new Request(
            "http://localhost:3000/api/transactions"
        );

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(mocks.findMany).not.toHaveBeenCalled();
    });

    it("11. API chỉ lấy dữ liệu của user trong session", async () => {
        const request = new Request(
            "http://localhost:3000/api/transactions?range=all"
        );

        const response = await GET(request);

        expect(response.status).toBe(200);

        expect(mocks.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: "user-a",
                }),
            })
        );
    });

    it("12. URL không thể ghi đè userId", async () => {
        const request = new Request(
            "http://localhost:3000/api/transactions?range=all&userId=user-b"
        );

        const response = await GET(request);

        expect(response.status).toBe(200);

        expect(mocks.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: "user-a",
                }),
            })
        );
    });
});
