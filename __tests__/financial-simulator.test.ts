
import { describe, expect, it } from "vitest";

import {
    getRecentCashFlowAverage,
    simulateFinancialGoal,
    type FinancialSimulationInput,
    type SimulatorTransaction,
} from "@/lib/financial-simulator";

// ==========================================
// FINANCE PLANNER V1.0
// FINANCIAL SIMULATOR UNIT TESTS
// ==========================================

// Dùng thời gian cố định để kết quả test
// không thay đổi theo ngày chạy máy.
const REFERENCE_DATE = new Date(
    "2026-11-27T03:00:00.000Z"
);

// Tạo giao dịch thử nghiệm.
function makeTransaction(
    date: string,
    type: "INCOME" | "EXPENSE",
    amount: number
): SimulatorTransaction {
    return {
        date: new Date(date),
        type,
        amount,
    };
}

// Tạo dữ liệu mô phỏng mặc định.
function makeInput(
    overrides: Partial<FinancialSimulationInput> = {}
): FinancialSimulationInput {
    return {
        targetCost: 15_000_000,
        savedAmount: 6_000_000,
        monthlySavings: 1_000_000,
        extraMonthlySavings: 500_000,
        ...overrides,
    };
}

// ==========================================
// GROUP 1 - PHÂN TÍCH DÒNG TIỀN
// ==========================================

describe("Financial Simulator - Cash Flow", () => {
    it("Tính đúng trung bình 3 tháng đã hoàn thành", () => {
        const transactions = [
            makeTransaction(
                "2026-08-10T03:00:00Z",
                "INCOME",
                9_000_000
            ),
            makeTransaction(
                "2026-08-15T03:00:00Z",
                "EXPENSE",
                3_000_000
            ),
            makeTransaction(
                "2026-09-10T03:00:00Z",
                "INCOME",
                12_000_000
            ),
            makeTransaction(
                "2026-09-15T03:00:00Z",
                "EXPENSE",
                6_000_000
            ),
            makeTransaction(
                "2026-10-10T03:00:00Z",
                "INCOME",
                15_000_000
            ),
            makeTransaction(
                "2026-10-15T03:00:00Z",
                "EXPENSE",
                9_000_000
            ),
        ];

        const result = getRecentCashFlowAverage(
            transactions,
            REFERENCE_DATE
        );

        expect(
            result.months.map((item) => item.month)
        ).toEqual([
            "2026-08",
            "2026-09",
            "2026-10",
        ]);

        expect(result.averageIncome).toBe(
            12_000_000
        );

        expect(result.averageExpense).toBe(
            6_000_000
        );

        expect(result.averageAvailable).toBe(
            6_000_000
        );
    });

    it("Không tính tháng hiện tại chưa kết thúc", () => {
        const transactions = [
            makeTransaction(
                "2026-10-15T03:00:00Z",
                "INCOME",
                3_000_000
            ),
            makeTransaction(
                "2026-11-10T03:00:00Z",
                "INCOME",
                99_000_000
            ),
        ];

        const result = getRecentCashFlowAverage(
            transactions,
            REFERENCE_DATE,
            1
        );

        expect(result.averageIncome).toBe(
            3_000_000
        );
    });

    it("Bỏ qua giao dịch ngoài khoảng phân tích", () => {
        const transactions = [
            makeTransaction(
                "2026-07-10T03:00:00Z",
                "INCOME",
                50_000_000
            ),
            makeTransaction(
                "2026-10-10T03:00:00Z",
                "INCOME",
                6_000_000
            ),
        ];

        const result = getRecentCashFlowAverage(
            transactions,
            REFERENCE_DATE,
            3
        );

        expect(result.averageIncome).toBe(
            2_000_000
        );
    });

    it("Không có giao dịch thì kết quả bằng 0", () => {
        const result = getRecentCashFlowAverage(
            [],
            REFERENCE_DATE
        );

        expect(result.months).toHaveLength(3);
        expect(result.averageIncome).toBe(0);
        expect(result.averageExpense).toBe(0);
        expect(result.averageAvailable).toBe(0);
    });

    it("Tháng không có giao dịch vẫn tham gia tính trung bình", () => {
        const result = getRecentCashFlowAverage(
            [
                makeTransaction(
                    "2026-09-10T03:00:00Z",
                    "INCOME",
                    3_000_000
                ),
            ],
            REFERENCE_DATE,
            3
        );

        expect(result.averageIncome).toBe(
            1_000_000
        );

        expect(result.months).toHaveLength(3);
    });

    it("Không trả khả năng tiết kiệm âm", () => {
        const result = getRecentCashFlowAverage(
            [
                makeTransaction(
                    "2026-10-10T03:00:00Z",
                    "INCOME",
                    3_000_000
                ),
                makeTransaction(
                    "2026-10-11T03:00:00Z",
                    "EXPENSE",
                    6_000_000
                ),
            ],
            REFERENCE_DATE,
            1
        );

        expect(result.months[0].balance).toBe(
            -3_000_000
        );

        expect(result.averageAvailable).toBe(0);
    });

    it("Bỏ qua giao dịch có dữ liệu không hợp lệ", () => {
        const transactions: SimulatorTransaction[] = [
            makeTransaction(
                "2026-10-10T03:00:00Z",
                "INCOME",
                100_000
            ),
            makeTransaction(
                "2026-10-11T03:00:00Z",
                "INCOME",
                0
            ),
            makeTransaction(
                "2026-10-12T03:00:00Z",
                "INCOME",
                -500
            ),
            makeTransaction(
                "2026-10-13T03:00:00Z",
                "INCOME",
                100.5
            ),
            {
                date: new Date("invalid"),
                type: "INCOME",
                amount: 500_000,
            },
        ];

        const result = getRecentCashFlowAverage(
            transactions,
            REFERENCE_DATE,
            1
        );

        expect(result.averageIncome).toBe(
            100_000
        );
    });

    it("Xử lý đúng khi chuyển năm", () => {
        const result = getRecentCashFlowAverage(
            [],
            new Date("2027-01-20T03:00:00Z"),
            3
        );

        expect(
            result.months.map((item) => item.month)
        ).toEqual([
            "2026-10",
            "2026-11",
            "2026-12",
        ]);
    });

    it("Phân loại tháng đúng theo múi giờ Việt Nam", () => {
        // 16:59 UTC = 23:59 ngày 31/10 VN.
        // 17:00 UTC = 00:00 ngày 01/11 VN.
        const transactions = [
            makeTransaction(
                "2026-10-31T16:59:00Z",
                "INCOME",
                100_000
            ),
            makeTransaction(
                "2026-10-31T17:00:00Z",
                "INCOME",
                200_000
            ),
        ];

        const result = getRecentCashFlowAverage(
            transactions,
            new Date("2026-11-01T01:00:00Z"),
            1
        );

        expect(result.months[0].month).toBe(
            "2026-10"
        );

        expect(result.averageIncome).toBe(
            100_000
        );
    });

    it("Từ chối số tháng phân tích không hợp lệ", () => {
        for (const monthCount of [0, 13, 1.5]) {
            expect(() =>
                getRecentCashFlowAverage(
                    [],
                    REFERENCE_DATE,
                    monthCount
                )
            ).toThrow(RangeError);
        }

        expect(
            getRecentCashFlowAverage(
                [],
                REFERENCE_DATE,
                12
            ).months
        ).toHaveLength(12);
    });
});

// ==========================================
// GROUP 2 - MÔ PHỎNG MỤC TIÊU
// ==========================================

describe("Financial Simulator - Goal Simulation", () => {
    it("So sánh đúng hai kịch bản tiết kiệm", () => {
        const result = simulateFinancialGoal(
            makeInput()
        );

        expect(result.remaining).toBe(
            9_000_000
        );

        expect(
            result.baselineMonthlySavings
        ).toBe(1_000_000);

        expect(
            result.scenarioMonthlySavings
        ).toBe(1_500_000);

        expect(result.baselineMonths).toBe(9);
        expect(result.scenarioMonths).toBe(6);
        expect(result.monthsFaster).toBe(3);
    });

    it("Tạo dữ liệu biểu đồ tích lũy chính xác", () => {
        const result = simulateFinancialGoal(
            makeInput()
        );

        expect(result.projection[0]).toEqual({
            month: 0,
            baseline: 6_000_000,
            scenario: 6_000_000,
        });

        expect(result.projection[1]).toEqual({
            month: 1,
            baseline: 7_000_000,
            scenario: 7_500_000,
        });

        expect(result.projection[6]).toEqual({
            month: 6,
            baseline: 12_000_000,
            scenario: 15_000_000,
        });

        expect(result.projection[9]).toEqual({
            month: 9,
            baseline: 15_000_000,
            scenario: 15_000_000,
        });
    });

    it("Mục tiêu đã hoàn thành cần 0 tháng", () => {
        const result = simulateFinancialGoal(
            makeInput({
                savedAmount: 15_000_000,
            })
        );

        expect(result.remaining).toBe(0);
        expect(result.baselineMonths).toBe(0);
        expect(result.scenarioMonths).toBe(0);
        expect(result.monthsFaster).toBe(0);
    });

    it("Không tiết kiệm thì chưa xác định thời gian đạt mục tiêu", () => {
        const result = simulateFinancialGoal(
            makeInput({
                monthlySavings: 0,
                extraMonthlySavings: 0,
            })
        );

        expect(result.baselineMonths).toBeNull();
        expect(result.scenarioMonths).toBeNull();
        expect(result.monthsFaster).toBeNull();
    });

    it("Có thể mô phỏng khi chỉ có khoản tiết kiệm tăng thêm", () => {
        const result = simulateFinancialGoal(
            makeInput({
                monthlySavings: 0,
                extraMonthlySavings: 1_000_000,
            })
        );

        expect(result.baselineMonths).toBeNull();
        expect(result.scenarioMonths).toBe(9);

        // Không có mốc ban đầu để tính
        // chính xác số tháng rút ngắn.
        expect(result.monthsFaster).toBeNull();
    });

    it("Tính số tiền cần tiết kiệm để hoàn thành trong 5 tháng", () => {
        const result = simulateFinancialGoal(
            makeInput({
                targetMonths: 5,
            })
        );

        expect(result.requiredMonthlySavings).toBe(
            1_800_000
        );

        expect(result.additionalNeeded).toBe(
            300_000
        );

        expect(result.meetsDeadline).toBe(false);
    });

    it("Xác nhận kịch bản đáp ứng thời hạn 6 tháng", () => {
        const result = simulateFinancialGoal(
            makeInput({
                targetMonths: 6,
            })
        );

        expect(result.requiredMonthlySavings).toBe(
            1_500_000
        );

        expect(result.additionalNeeded).toBe(0);
        expect(result.meetsDeadline).toBe(true);
    });

    it("Không có thời hạn thì các kết quả deadline bằng null", () => {
        const result = simulateFinancialGoal(
            makeInput()
        );

        expect(
            result.requiredMonthlySavings
        ).toBeNull();

        expect(
            result.additionalNeeded
        ).toBeNull();

        expect(result.meetsDeadline).toBeNull();
    });

    it("Vẫn tính được khoản cần dành khi chưa có kế hoạch tiết kiệm", () => {
        const result = simulateFinancialGoal(
            makeInput({
                monthlySavings: 0,
                extraMonthlySavings: 0,
                targetMonths: 9,
            })
        );

        expect(result.requiredMonthlySavings).toBe(
            1_000_000
        );

        expect(result.additionalNeeded).toBe(
            1_000_000
        );

        expect(result.meetsDeadline).toBe(false);
    });

    it("Giới hạn biểu đồ tối đa 24 tháng", () => {
        const result = simulateFinancialGoal(
            makeInput({
                targetCost: 2_000_000_000,
                savedAmount: 0,
                monthlySavings: 1,
                extraMonthlySavings: 0,
            })
        );

        // 24 tháng + điểm bắt đầu tháng 0.
        expect(result.projection).toHaveLength(
            25
        );

        expect(
            result.projection.at(-1)?.month
        ).toBe(24);

        expect(result.baselineMonths).toBe(
            2_000_000_000
        );
    });

    it("Không làm thay đổi dữ liệu đầu vào", () => {
        const input = makeInput({
            targetMonths: 5,
        });

        const original = { ...input };

        simulateFinancialGoal(input);

        expect(input).toEqual(original);
    });
});

// ==========================================
// GROUP 3 - VALIDATION
// ==========================================

describe("Financial Simulator - Input Validation", () => {
    it("Từ chối chi phí mục tiêu không hợp lệ", () => {
        const values = [
            0,
            -1,
            1.5,
            2_147_483_648,
            Number.NaN,
        ];

        for (const targetCost of values) {
            expect(() =>
                simulateFinancialGoal(
                    makeInput({ targetCost })
                )
            ).toThrow(RangeError);
        }
    });

    it("Từ chối số tiền đã tiết kiệm không hợp lệ", () => {
        const values = [
            -1,
            0.5,
            2_147_483_648,
            Number.NaN,
        ];

        for (const savedAmount of values) {
            expect(() =>
                simulateFinancialGoal(
                    makeInput({ savedAmount })
                )
            ).toThrow(RangeError);
        }

        // Tiền tiết kiệm lớn hơn giá mục tiêu.
        expect(() =>
            simulateFinancialGoal(
                makeInput({
                    savedAmount: 16_000_000,
                })
            )
        ).toThrow(RangeError);
    });

    it("Từ chối khoản tiết kiệm hằng tháng không hợp lệ", () => {
        const values = [
            -100_000,
            100.5,
            2_147_483_648,
        ];

        for (const monthlySavings of values) {
            expect(() =>
                simulateFinancialGoal(
                    makeInput({ monthlySavings })
                )
            ).toThrow(RangeError);
        }
    });

    it("Từ chối khoản tiết kiệm tăng thêm không hợp lệ", () => {
        const values = [
            -1,
            0.5,
            2_147_483_648,
        ];

        for (const extraMonthlySavings of values) {
            expect(() =>
                simulateFinancialGoal(
                    makeInput({ extraMonthlySavings })
                )
            ).toThrow(RangeError);
        }
    });

    it("Từ chối thời hạn ngoài khoảng 1 đến 120 tháng", () => {
        const values = [
            0,
            -1,
            1.5,
            121,
        ];

        for (const targetMonths of values) {
            expect(() =>
                simulateFinancialGoal(
                    makeInput({ targetMonths })
                )
            ).toThrow(RangeError);
        }

        expect(() =>
            simulateFinancialGoal(
                makeInput({ targetMonths: 120 })
            )
        ).not.toThrow();
    });
});
