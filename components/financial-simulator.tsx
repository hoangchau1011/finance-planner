
"use client";

import {
    useMemo,
    useState,
} from "react";

import Link from "next/link";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { formatVND } from "@/lib/finance";

import {
    simulateFinancialGoal,
    type CashFlowAverage,
    type FinancialSimulationResult,
} from "@/lib/financial-simulator";

// ==========================================
// FINANCE PLANNER V1.0
// FINANCIAL SIMULATOR UI
// ==========================================

const MAX_VND = 2_147_483_647;

// ==========================================
// 1. KIỂU DỮ LIỆU
// ==========================================

export type FinancialSimulatorGoal = {
    id: string;
    name: string;
    cost: number;
    savedAmount: number;
};

type FinancialSimulatorProps = {
    goals: FinancialSimulatorGoal[];
    cashFlow: CashFlowAverage;
};

// ==========================================
// 2. HÀM TIỆN ÍCH
// ==========================================

function parseVND(value: string): number | null {
    const trimmed = value.trim();

    if (!/^(0|[1-9]\d*)$/.test(trimmed)) {
        return null;
    }

    const amount = Number(trimmed);

    if (
        !Number.isSafeInteger(amount) ||
        amount > MAX_VND
    ) {
        return null;
    }

    return amount;
}

function formatMonths(
    months: number | null
): string {
    if (months === null) {
        return "Chưa xác định";
    }

    if (months === 0) {
        return "Đã hoàn thành";
    }

    return `${months.toLocaleString("vi-VN")} tháng`;
}

function StatBox({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description?: string;
}) {
    return (
        <div className="rounded-2xl border border-line bg-card p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">
                {label}
            </p>

            <p className="mt-3 break-words text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                {value}
            </p>

            {description && (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export function FinancialSimulator({
    goals,
    cashFlow,
}: FinancialSimulatorProps) {
    const [selectedGoalId, setSelectedGoalId] =
        useState(goals[0]?.id ?? "");

    // Số tiền có thể tiết kiệm theo trung bình
    // 3 tháng chỉ là gợi ý, không bắt buộc.
    const [monthlySavings, setMonthlySavings] =
        useState(() =>
            String(
                Math.min(
                    MAX_VND,
                    Math.max(
                        0,
                        Math.round(cashFlow.averageAvailable)
                    )
                )
            )
        );

    // Khoản giả định tăng thêm mỗi tháng.
    const [
        extraMonthlySavings,
        setExtraMonthlySavings,
    ] = useState("500000");

    // Để trống nếu không muốn đặt thời hạn.
    const [targetMonths, setTargetMonths] =
        useState("6");

    const selectedGoal =
        goals.find(
            (goal) => goal.id === selectedGoalId
        ) ?? goals[0];

    // ========================================
    // 4. TÍNH TOÁN KẾT QUẢ
    // ========================================

    const calculation = useMemo<{
        result: FinancialSimulationResult | null;
        error: string | null;
    }>(() => {
        if (!selectedGoal) {
            return {
                result: null,
                error: null,
            };
        }

        const base = parseVND(monthlySavings);
        const extra = parseVND(extraMonthlySavings);

        if (base === null || extra === null) {
            return {
                result: null,
                error:
                    "Số tiền phải là số nguyên không âm và không vượt giới hạn cho phép.",
            };
        }

        let deadline: number | undefined;

        if (targetMonths.trim() !== "") {
            const parsed = Number(targetMonths);

            if (
                !/^[1-9]\d*$/.test(targetMonths.trim()) ||
                !Number.isInteger(parsed) ||
                parsed < 1 ||
                parsed > 120
            ) {
                return {
                    result: null,
                    error:
                        "Thời hạn phải là số nguyên từ 1 đến 120 tháng.",
                };
            }

            deadline = parsed;
        }

        try {
            return {
                result: simulateFinancialGoal({
                    targetCost: selectedGoal.cost,
                    savedAmount: selectedGoal.savedAmount,
                    monthlySavings: base,
                    extraMonthlySavings: extra,
                    targetMonths: deadline,
                }),
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể tính toán kịch bản.",
            };
        }
    }, [
        selectedGoal,
        monthlySavings,
        extraMonthlySavings,
        targetMonths,
    ]);

    // ========================================
    // 5. GIAO DIỆN KHI CHƯA CÓ WISHLIST
    // ========================================

    if (!selectedGoal) {
        return (
            <section className="rounded-2xl border border-line bg-card p-6 text-center sm:p-10">
                <h2 className="text-xl font-bold text-foreground">
                    Chưa có mục tiêu tiết kiệm
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                    Hãy tạo ít nhất một mục tiêu Wishlist
                    để bắt đầu mô phỏng thời gian tiết kiệm.
                </p>

                <Link
                    href="/wishlist"
                    className="mt-5 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:opacity-90 dark:text-background"
                >
                    Tạo mục tiêu Wishlist
                </Link>
            </section>
        );
    }

    const result = calculation.result;

    const progress =
        selectedGoal.cost > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (selectedGoal.savedAmount /
                        selectedGoal.cost) *
                    100
                )
            )
            : 0;

    const remaining = Math.max(
        0,
        selectedGoal.cost - selectedGoal.savedAmount
    );

    // ========================================
    // 6. GIAO DIỆN CHÍNH
    // ========================================

    return (
        <div className="space-y-6">
            {/* ====================================
          THÔNG TIN DÒNG TIỀN
      ==================================== */}
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                <h2 className="text-xl font-bold text-foreground">
                    Phân tích dòng tiền gần đây
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Trung bình của 3 tháng đã hoàn thành
                    gần nhất. Tháng hiện tại chưa được
                    tính vào thống kê này.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <StatBox
                        label="Thu nhập trung bình"
                        value={formatVND(
                            cashFlow.averageIncome
                        )}
                    />

                    <StatBox
                        label="Chi tiêu trung bình"
                        value={formatVND(
                            cashFlow.averageExpense
                        )}
                    />

                    <StatBox
                        label="Chênh lệch khả dụng"
                        value={formatVND(
                            cashFlow.averageAvailable
                        )}
                        description="Gợi ý tham khảo, không phải số tiền đã tự động tiết kiệm."
                    />
                </div>

                <p className="mt-4 text-xs leading-6 text-muted-foreground">
                    Chênh lệch khả dụng được ước tính từ
                    thu nhập trừ chi tiêu đã ghi nhận.
                    Nếu dữ liệu chưa đầy đủ, kết quả
                    có thể chưa phản ánh thực tế.
                </p>
            </section>

            {/* ====================================
          CHỌN MỤC TIÊU
      ==================================== */}
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                <h2 className="text-xl font-bold text-foreground">
                    Chọn mục tiêu tiết kiệm
                </h2>

                <div className="mt-5">
                    <label
                        htmlFor="simulator-goal"
                        className="mb-2 block text-sm font-semibold text-foreground"
                    >
                        Mục tiêu Wishlist
                    </label>

                    <select
                        id="simulator-goal"
                        value={selectedGoal.id}
                        onChange={(event) =>
                            setSelectedGoalId(event.target.value)
                        }
                        className="w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                        {goals.map((goal) => (
                            <option
                                key={goal.id}
                                value={goal.id}
                            >
                                {goal.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <StatBox
                        label="Chi phí mục tiêu"
                        value={formatVND(selectedGoal.cost)}
                    />

                    <StatBox
                        label="Đã tiết kiệm"
                        value={formatVND(
                            selectedGoal.savedAmount
                        )}
                    />

                    <StatBox
                        label="Còn thiếu"
                        value={formatVND(remaining)}
                    />
                </div>

                <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">
                            Tiến độ hiện tại
                        </span>

                        <span className="text-sm font-bold text-brand">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    <div
                        role="progressbar"
                        aria-label={`Tiến độ ${selectedGoal.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                        className="h-3 overflow-hidden rounded-full bg-muted"
                    >
                        <div
                            className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* ====================================
          ĐIỀU CHỈNH KỊCH BẢN
      ==================================== */}
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                <h2 className="text-xl font-bold text-foreground">
                    Thiết lập kịch bản
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Thay đổi các giá trị bên dưới để
                    xem kết quả mô phỏng ngay lập tức.
                </p>

                <div className="mt-6 grid gap-7 lg:grid-cols-2">
                    {/* KHOẢN TIẾT KIỆM BAN ĐẦU */}
                    <div className="space-y-3">
                        <label
                            htmlFor="simulator-monthly"
                            className="block text-sm font-semibold text-foreground"
                        >
                            Dự định tiết kiệm mỗi tháng (VND)
                        </label>

                        <input
                            id="simulator-monthly"
                            type="number"
                            min="0"
                            max={MAX_VND}
                            step="1"
                            value={monthlySavings}
                            onChange={(event) =>
                                setMonthlySavings(event.target.value)
                            }
                            className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />

                        <input
                            type="range"
                            aria-label="Điều chỉnh tiết kiệm hằng tháng"
                            min="0"
                            max="10000000"
                            step="100000"
                            value={Math.min(
                                parseVND(monthlySavings) ?? 0,
                                10000000
                            )}
                            onChange={(event) =>
                                setMonthlySavings(event.target.value)
                            }
                            className="w-full accent-cyan-600"
                        />

                        <p className="text-xs text-muted-foreground">
                            Thanh kéo: 0–10 triệu đ. Có thể
                            nhập số lớn hơn trực tiếp vào ô.
                        </p>
                    </div>

                    {/* TIẾT KIỆM THÊM */}
                    <div className="space-y-3">
                        <label
                            htmlFor="simulator-extra"
                            className="block text-sm font-semibold text-foreground"
                        >
                            Thử tiết kiệm thêm mỗi tháng (VND)
                        </label>

                        <input
                            id="simulator-extra"
                            type="number"
                            min="0"
                            max={MAX_VND}
                            step="1"
                            value={extraMonthlySavings}
                            onChange={(event) =>
                                setExtraMonthlySavings(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />

                        <input
                            type="range"
                            aria-label="Điều chỉnh khoản tiết kiệm tăng thêm"
                            min="0"
                            max="3000000"
                            step="100000"
                            value={Math.min(
                                parseVND(extraMonthlySavings) ?? 0,
                                3000000
                            )}
                            onChange={(event) =>
                                setExtraMonthlySavings(
                                    event.target.value
                                )
                            }
                            className="w-full accent-cyan-600"
                        />

                        <div className="flex flex-wrap gap-2">
                            {[0, 250000, 500000, 1000000].map(
                                (amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() =>
                                            setExtraMonthlySavings(
                                                String(amount)
                                            )
                                        }
                                        className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        {amount === 0
                                            ? "Không tăng"
                                            : `+${formatVND(amount)}`}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* THỜI HẠN */}
                <div className="mt-7 max-w-md space-y-3">
                    <label
                        htmlFor="simulator-deadline"
                        className="block text-sm font-semibold text-foreground"
                    >
                        Muốn đạt mục tiêu trong bao nhiêu tháng?
                    </label>

                    <input
                        id="simulator-deadline"
                        type="number"
                        min="1"
                        max="120"
                        step="1"
                        placeholder="Để trống nếu chưa đặt thời hạn"
                        value={targetMonths}
                        onChange={(event) =>
                            setTargetMonths(event.target.value)
                        }
                        className="w-full rounded-xl border border-line bg-card px-4 py-3 text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />

                    <p className="text-xs text-muted-foreground">
                        Nhập từ 1 đến 120 tháng, hoặc để
                        trống nếu không cần thời hạn.
                    </p>
                </div>

                {calculation.error && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300"
                    >
                        {calculation.error}
                    </p>
                )}
            </section>

            {/* ====================================
          KẾT QUẢ MÔ PHỎNG
      ==================================== */}
            {result && (
                <div className="space-y-6">
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Kết quả so sánh
                        </h2>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <StatBox
                                label="Kế hoạch hiện tại"
                                value={formatMonths(
                                    result.baselineMonths
                                )}
                                description={`Tiết kiệm ${formatVND(result.baselineMonthlySavings)}/tháng`}
                            />

                            <StatBox
                                label="Kịch bản mới"
                                value={formatMonths(
                                    result.scenarioMonths
                                )}
                                description={`Tiết kiệm ${formatVND(result.scenarioMonthlySavings)}/tháng`}
                            />

                            <StatBox
                                label="Thời gian rút ngắn"
                                value={
                                    result.monthsFaster === null
                                        ? "Chưa xác định"
                                        : `${result.monthsFaster} tháng`
                                }
                                description="So sánh thời gian dự kiến giữa hai kịch bản."
                            />
                        </div>

                        {/* KẾ HOẠCH THEO THỜI HẠN */}
                        {result.requiredMonthlySavings !== null && (
                            <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-5">
                                <h3 className="font-semibold text-foreground">
                                    Kế hoạch theo thời hạn
                                </h3>

                                <p className="mt-3 text-sm text-muted-foreground">
                                    Để đạt mục tiêu trong{" "}
                                    <strong className="text-foreground">
                                        {targetMonths} tháng
                                    </strong>
                                    , bạn cần dành khoảng{" "}
                                    <strong className="text-foreground">
                                        {formatVND(
                                            result.requiredMonthlySavings
                                        )}/tháng
                                    </strong>.
                                </p>

                                {result.meetsDeadline ? (
                                    <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        Kịch bản hiện tại đáp ứng thời hạn đề ra.
                                    </p>
                                ) : (
                                    <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
                                        Cần thêm khoảng{" "}
                                        {formatVND(
                                            result.additionalNeeded ?? 0
                                        )}/tháng để đạt thời hạn.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* =================================
              BIỂU ĐỒ TÍCH LŨY
          ================================= */}
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Biểu đồ dự kiến tích lũy
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            So sánh số tiền tiết kiệm tích lũy
                            theo từng tháng, tối đa 24 tháng.
                        </p>

                        <div
                            aria-label="Biểu đồ so sánh tích lũy tiết kiệm"
                            className="mt-6 h-80 w-full"
                        >
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <LineChart
                                    data={result.projection}
                                    margin={{
                                        top: 12,
                                        right: 16,
                                        left: 4,
                                        bottom: 8,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        opacity={0.3}
                                    />

                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={(value: number) =>
                                            `T${value}`
                                        }
                                        tick={{ fontSize: 11 }}
                                    />

                                    <YAxis
                                        width={70}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(value: number) =>
                                            `${Number(
                                                (value / 1_000_000).toFixed(1)
                                            )}tr`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            formatVND(Number(value ?? 0))
                                        }
                                        labelFormatter={(label) =>
                                            `Tháng ${label}`
                                        }
                                    />

                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="baseline"
                                        name="Kế hoạch hiện tại"
                                        stroke="#0891b2"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="scenario"
                                        name="Kịch bản mới"
                                        stroke="#a855f7"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* BẢNG THAY THẾ CHO BIỂU ĐỒ */}
                        <details className="mt-5 rounded-xl border border-line p-4">
                            <summary className="cursor-pointer text-sm font-semibold text-brand">
                                Xem dữ liệu biểu đồ dạng bảng
                            </summary>

                            <div className="mt-4 max-h-72 overflow-auto">
                                <table className="w-full min-w-[480px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-line">
                                            <th scope="col" className="p-2">
                                                Tháng
                                            </th>
                                            <th scope="col" className="p-2">
                                                Hiện tại
                                            </th>
                                            <th scope="col" className="p-2">
                                                Kịch bản mới
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {result.projection.map(
                                            (point) => (
                                                <tr
                                                    key={point.month}
                                                    className="border-b border-line"
                                                >
                                                    <td className="p-2">
                                                        {point.month}
                                                    </td>
                                                    <td className="p-2 tabular-nums">
                                                        {formatVND(
                                                            point.baseline
                                                        )}
                                                    </td>
                                                    <td className="p-2 tabular-nums">
                                                        {formatVND(
                                                            point.scenario
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </section>

                    <p className="text-xs leading-6 text-muted-foreground">
                        Đây là mô phỏng dựa trên mức tiết kiệm
                        giả định không đổi theo tháng. Kết quả
                        không tính lãi suất, lạm phát hoặc
                        những khoản thu chi phát sinh sau này.
                        Việc thay đổi kịch bản không làm thay
                        đổi số dư, giao dịch hoặc Wishlist.
                    </p>
                </div>
            )}
        </div>
    );
}
