
import { getVietnamMonthKey } from "@/lib/analytics";

// ==========================================
// FINANCE PLANNER V1.0
// FINANCIAL GOAL SIMULATOR
// ==========================================

// Chỉ tính toán, không kết nối Prisma.
// Không ghi dữ liệu giao dịch hoặc Wishlist.

const MAX_VND = 2_147_483_647;
const MAX_PROJECTION_MONTHS = 24;

// ==========================================
// 1. KIỂU DỮ LIỆU
// ==========================================

export type SimulatorTransaction = {
    type: "INCOME" | "EXPENSE";
    amount: number;
    date: Date;
};

export type MonthlyCashFlow = {
    month: string;
    income: number;
    expense: number;
    balance: number;
};

export type CashFlowAverage = {
    months: MonthlyCashFlow[];
    averageIncome: number;
    averageExpense: number;
    averageAvailable: number;
};

export type FinancialSimulationInput = {
    // Giá mục tiêu Wishlist.
    targetCost: number;

    // Tiền thực tế đã dành cho mục tiêu.
    savedAmount: number;

    // Khoản dự định tiết kiệm mỗi tháng.
    monthlySavings: number;

    // Khoản có thể tiết kiệm thêm.
    extraMonthlySavings: number;

    // Số tháng mong muốn đạt mục tiêu.
    targetMonths?: number;
};

export type ProjectionPoint = {
    month: number;
    baseline: number;
    scenario: number;
};

export type FinancialSimulationResult = {
    remaining: number;

    baselineMonthlySavings: number;
    scenarioMonthlySavings: number;

    baselineMonths: number | null;
    scenarioMonths: number | null;

    monthsFaster: number | null;

    requiredMonthlySavings: number | null;
    additionalNeeded: number | null;
    meetsDeadline: boolean | null;

    projection: ProjectionPoint[];
};

// ==========================================
// 2. HÀM KIỂM TRA SỐ TIỀN
// ==========================================

function validateAmount(
    value: number,
    fieldName: string,
    allowZero = true
): void {
    if (
        !Number.isSafeInteger(value) ||
        value < (allowZero ? 0 : 1) ||
        value > MAX_VND
    ) {
        throw new RangeError(
            `${fieldName} phải là số nguyên hợp lệ trong giới hạn VND.`
        );
    }
}

// ==========================================
// 3. DỊCH CHUYỂN THÁNG
// ==========================================

function shiftMonth(
    month: string,
    offset: number
): string {
    const [year, monthNumber] =
        month.split("-").map(Number);

    const date = new Date(
        Date.UTC(
            year,
            monthNumber - 1 + offset,
            1
        )
    );

    const nextYear = date.getUTCFullYear();

    const nextMonth = String(
        date.getUTCMonth() + 1
    ).padStart(2, "0");

    return `${nextYear}-${nextMonth}`;
}

// ==========================================
// 4. PHÂN TÍCH DÒNG TIỀN GẦN ĐÂY
// ==========================================

// Dùng các tháng đã hoàn thành,
// không tính tháng hiện tại chưa kết thúc.

export function getRecentCashFlowAverage(
    transactions: readonly SimulatorTransaction[],
    referenceDate: Date = new Date(),
    monthCount = 3
): CashFlowAverage {
    if (
        !Number.isInteger(monthCount) ||
        monthCount < 1 ||
        monthCount > 12
    ) {
        throw new RangeError(
            "Số tháng phân tích phải từ 1 đến 12."
        );
    }

    const currentMonth =
        getVietnamMonthKey(referenceDate);

    const months: MonthlyCashFlow[] =
        Array.from(
            { length: monthCount },
            (_, index) => ({
                month: shiftMonth(
                    currentMonth,
                    index - monthCount
                ),
                income: 0,
                expense: 0,
                balance: 0,
            })
        );

    const monthMap = new Map(
        months.map((item) => [item.month, item])
    );

    for (const transaction of transactions) {
        // Bỏ qua dữ liệu không hợp lệ.
        if (
            !(transaction.date instanceof Date) ||
            Number.isNaN(transaction.date.getTime()) ||
            !Number.isSafeInteger(transaction.amount) ||
            transaction.amount <= 0
        ) {
            continue;
        }

        const key =
            getVietnamMonthKey(transaction.date);

        const monthData = monthMap.get(key);

        if (!monthData) {
            continue;
        }

        if (transaction.type === "INCOME") {
            monthData.income += transaction.amount;
        } else if (transaction.type === "EXPENSE") {
            monthData.expense += transaction.amount;
        }
    }

    for (const month of months) {
        month.balance = month.income - month.expense;
    }

    const incomeTotal = months.reduce(
        (sum, month) => sum + month.income,
        0
    );

    const expenseTotal = months.reduce(
        (sum, month) => sum + month.expense,
        0
    );

    const averageIncome = Math.round(
        incomeTotal / monthCount
    );

    const averageExpense = Math.round(
        expenseTotal / monthCount
    );

    return {
        months,
        averageIncome,
        averageExpense,

        // Đây là dòng tiền có thể dành dụm
        // theo ước tính, không phải khoản
        // thực tế đã chuyển vào Wishlist.
        averageAvailable: Math.max(
            0,
            averageIncome - averageExpense
        ),
    };
}

// ==========================================
// 5. TÍNH SỐ THÁNG CẦN ĐỂ ĐẠT MỤC TIÊU
// ==========================================

function monthsToReachGoal(
    remaining: number,
    monthlySavings: number
): number | null {
    // Đã hoàn thành mục tiêu.
    if (remaining <= 0) {
        return 0;
    }

    // Không có khoản tiết kiệm mỗi tháng:
    // chưa thể xác định thời điểm hoàn thành.
    if (monthlySavings <= 0) {
        return null;
    }

    return Math.ceil(
        remaining / monthlySavings
    );
}

// ==========================================
// 6. MÔ PHỎNG KẾ HOẠCH TIẾT KIỆM
// ==========================================

export function simulateFinancialGoal(
    input: FinancialSimulationInput
): FinancialSimulationResult {
    const {
        targetCost,
        savedAmount,
        monthlySavings,
        extraMonthlySavings,
        targetMonths,
    } = input;

    // Bước 1: Kiểm tra dữ liệu.
    validateAmount(
        targetCost,
        "Chi phí mục tiêu",
        false
    );

    validateAmount(
        savedAmount,
        "Tiền đã tiết kiệm"
    );

    validateAmount(
        monthlySavings,
        "Tiết kiệm hằng tháng"
    );

    validateAmount(
        extraMonthlySavings,
        "Tiết kiệm tăng thêm"
    );

    if (savedAmount > targetCost) {
        throw new RangeError(
            "Tiền đã tiết kiệm không được vượt chi phí mục tiêu."
        );
    }

    if (
        targetMonths !== undefined &&
        (
            !Number.isInteger(targetMonths) ||
            targetMonths < 1 ||
            targetMonths > 120
        )
    ) {
        throw new RangeError(
            "Thời hạn mục tiêu phải từ 1 đến 120 tháng."
        );
    }

    // Bước 2: Tính số tiền còn thiếu.
    const remaining =
        targetCost - savedAmount;

    // Bước 3: So sánh hai kịch bản.
    const baselineMonthlySavings =
        monthlySavings;

    const scenarioMonthlySavings =
        monthlySavings + extraMonthlySavings;

    const baselineMonths = monthsToReachGoal(
        remaining,
        baselineMonthlySavings
    );

    const scenarioMonths = monthsToReachGoal(
        remaining,
        scenarioMonthlySavings
    );

    // Bước 4: Tính thời gian rút ngắn.
    const monthsFaster =
        baselineMonths !== null &&
            scenarioMonths !== null
            ? Math.max(
                0,
                baselineMonths - scenarioMonths
            )
            : null;

    // Bước 5: Kế hoạch theo thời hạn.
    const requiredMonthlySavings =
        targetMonths !== undefined
            ? Math.ceil(remaining / targetMonths)
            : null;

    const additionalNeeded =
        requiredMonthlySavings !== null
            ? Math.max(
                0,
                requiredMonthlySavings -
                scenarioMonthlySavings
            )
            : null;

    const meetsDeadline =
        targetMonths !== undefined
            ? scenarioMonths !== null &&
            scenarioMonths <= targetMonths
            : null;

    // Bước 6: Tạo dữ liệu biểu đồ.
    // Hiển thị tối đa 24 tháng.
    const chartHorizon = Math.min(
        MAX_PROJECTION_MONTHS,
        Math.max(
            6,
            baselineMonths ?? 0,
            scenarioMonths ?? 0,
            targetMonths ?? 0
        )
    );

    const projection: ProjectionPoint[] =
        Array.from(
            { length: chartHorizon + 1 },
            (_, month) => ({
                month,

                baseline: Math.min(
                    targetCost,
                    savedAmount +
                    baselineMonthlySavings * month
                ),

                scenario: Math.min(
                    targetCost,
                    savedAmount +
                    scenarioMonthlySavings * month
                ),
            })
        );

    return {
        remaining,

        baselineMonthlySavings,
        scenarioMonthlySavings,

        baselineMonths,
        scenarioMonths,
        monthsFaster,

        requiredMonthlySavings,
        additionalNeeded,
        meetsDeadline,

        projection,
    };
}
