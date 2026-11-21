
import { describe, expect, it } from "vitest";
import * as z from "zod";

import {
    transactionSchema,
    transactionIdSchema,
    transactionFilterSchema,
    parseTransactionFilters,
    readTransactionValues,
} from "@/lib/validation";

// Giao dịch mẫu hợp lệ
const validTransaction = {
    type: "EXPENSE",
    amount: "150000",
    description: "Ăn trưa",
    category: "FOOD",
    date: "2026-11-21",
};

describe("Transaction Validation - Zod 4", () => {
    it("1. Chấp nhận giao dịch hợp lệ", () => {
        const result = transactionSchema.safeParse(
            validTransaction,
        );

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.amount).toBe(150000);
            expect(result.data.type).toBe("EXPENSE");
            expect(result.data.category).toBe("FOOD");
        }
    });

    it("2. Từ chối số tiền âm", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            amount: "-50000",
        });

        expect(result.success).toBe(false);
    });

    it("3. Từ chối số tiền bằng 0", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            amount: "0",
        });

        expect(result.success).toBe(false);
    });

    it("4. Từ chối số tiền thập phân", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            amount: "15000.5",
        });

        expect(result.success).toBe(false);
    });

    it("5. Từ chối số tiền vượt giới hạn Int", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            amount: "2147483648",
        });

        expect(result.success).toBe(false);
    });

    it("6. Từ chối mô tả rỗng", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            description: "   ",
        });

        expect(result.success).toBe(false);
    });

    it("7. Từ chối mô tả dài quá 120 ký tự", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            description: "A".repeat(121),
        });

        expect(result.success).toBe(false);
    });

    it("8. Từ chối loại giao dịch không hợp lệ", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            type: "TRANSFER",
        });

        expect(result.success).toBe(false);
    });

    it("9. Từ chối danh mục không hợp lệ", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            category: "INVALID_CATEGORY",
        });

        expect(result.success).toBe(false);
    });

    it("10. Từ chối ngày sai định dạng", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            date: "21/11/2026",
        });

        expect(result.success).toBe(false);
    });

    it("11. Trả lỗi đúng trường bằng z.flattenError", () => {
        const result = transactionSchema.safeParse({
            ...validTransaction,
            amount: "-100",
            description: "",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = z.flattenError(result.error);

            expect(errors.fieldErrors.amount).toBeDefined();
            expect(
                errors.fieldErrors.description,
            ).toBeDefined();
        }
    });
});

describe("Transaction ID Validation", () => {
    it("12. Chấp nhận ID hợp lệ", () => {
        expect(
            transactionIdSchema.safeParse("clx123abc").success,
        ).toBe(true);
    });

    it("13. Từ chối ID rỗng", () => {
        expect(
            transactionIdSchema.safeParse("").success,
        ).toBe(false);
    });
});

describe("Transaction URL Filters", () => {
    it("14. Mặc định lọc tháng hiện tại", () => {
        const result = parseTransactionFilters({});

        expect(result).toEqual({
            range: "this-month",
        });
    });

    it("15. Chấp nhận bộ lọc hợp lệ", () => {
        const result = transactionFilterSchema.safeParse({
            range: "last-month",
            type: "EXPENSE",
            category: "FOOD",
        });

        expect(result.success).toBe(true);
    });

    it("16. Đọc đúng nhiều bộ lọc từ URL", () => {
        const result = parseTransactionFilters({
            range: "all",
            type: "INCOME",
            category: "SALARY",
        });

        expect(result).toEqual({
            range: "all",
            type: "INCOME",
            category: "SALARY",
        });
    });

    it("17. Bỏ qua các bộ lọc không hợp lệ", () => {
        const result = parseTransactionFilters({
            range: "invalid",
            type: "TRANSFER",
            category: "UNKNOWN",
        });

        expect(result).toEqual({
            range: "this-month",
        });
    });
});

describe("Transaction FormData", () => {
    it("18. Đọc đúng dữ liệu từ form", () => {
        const formData = new FormData();

        formData.set("type", "EXPENSE");
        formData.set("amount", "150000");
        formData.set("description", "Ăn trưa");
        formData.set("category", "FOOD");
        formData.set("date", "2026-11-21");

        const result = readTransactionValues(formData);

        expect(result).toEqual(validTransaction);
    });
});
