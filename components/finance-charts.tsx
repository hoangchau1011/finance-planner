
"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type {
    CategoryExpense,
    MonthlySummary,
} from "@/lib/analytics";

import { formatVND } from "@/lib/finance";

// ==========================================
// FINANCE PLANNER V1.1 - FINANCE CHARTS
// ==========================================

type FinanceChartsProps = {
    monthly: readonly MonthlySummary[];
    categories: readonly CategoryExpense[];
};

const CATEGORY_COLORS = [
    "#0891b2",
    "#0d9488",
    "#6366f1",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#84cc16",
    "#f97316",
];

// Rút gọn số tiền trên trục biểu đồ.
function compactVND(value: number): string {
    const absolute = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absolute >= 1_000_000_000) {
        return `${sign}${(absolute / 1_000_000_000)
            .toFixed(1)
            .replace(".", ",")} tỷ`;
    }

    if (absolute >= 1_000_000) {
        return `${sign}${(absolute / 1_000_000)
            .toFixed(1)
            .replace(".", ",")} tr`;
    }

    if (absolute >= 1_000) {
        return `${sign}${Math.round(
            absolute / 1_000
        )}k`;
    }

    return `${value}`;
}

// Giao diện khi chưa có dữ liệu.
function ChartEmptyState({
    message,
}: {
    message: string;
}) {
    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-muted/20 px-5 text-center">
            <div
                aria-hidden="true"
                className="mb-3 text-4xl text-brand"
            >
                ◌
            </div>

            <p className="font-semibold text-foreground">
                Chưa có dữ liệu
            </p>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {message}
            </p>
        </div>
    );
}

// ==========================================
// 1. BIỂU ĐỒ THU NHẬP / CHI TIÊU
// ==========================================

function MonthlyTrendChart({
    data,
}: {
    data: readonly MonthlySummary[];
}) {
    const hasData = data.some(
        (item) => item.income > 0 || item.expense > 0
    );

    return (
        <section
            aria-labelledby="monthly-chart-heading"
            className="min-w-0 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
        >
            <div className="mb-6">
                <h2
                    id="monthly-chart-heading"
                    className="text-lg font-bold text-foreground"
                >
                    Thu nhập và chi tiêu
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    So sánh dòng tiền theo từng tháng
                </p>
            </div>

            {!hasData ? (
                <ChartEmptyState
                    message="Hãy thêm giao dịch thu nhập hoặc chi tiêu để xem biểu đồ."
                />
            ) : (
                <div
                    className="h-[300px] w-full sm:h-[340px]"
                    role="img"
                    aria-label="Biểu đồ cột so sánh thu nhập và chi tiêu theo tháng"
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            accessibilityLayer
                            data={[...data]}
                            margin={{
                                top: 10,
                                right: 8,
                                bottom: 8,
                                left: -15,
                            }}
                            barGap={5}
                        >
                            <CartesianGrid
                                vertical={false}
                                stroke="var(--line)"
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={12}
                                tick={{
                                    fill: "var(--muted-foreground)",
                                    fontSize: 12,
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={compactVND}
                                tick={{
                                    fill: "var(--muted-foreground)",
                                    fontSize: 12,
                                }}
                            />

                            <Tooltip
                                cursor={{
                                    fill: "var(--muted)",
                                    opacity: 0.5,
                                }}
                                contentStyle={{
                                    backgroundColor: "var(--card)",
                                    border: "1px solid var(--line)",
                                    borderRadius: 12,
                                    color: "var(--foreground)",
                                }}
                                labelStyle={{
                                    color: "var(--foreground)",
                                }}
                                formatter={(value, name) => [
                                    formatVND(Number(value ?? 0)),
                                    String(name),
                                ]}
                            />

                            <Legend
                                wrapperStyle={{ paddingTop: 16 }}
                                formatter={(value) => (
                                    <span
                                        style={{
                                            color: "var(--foreground)",
                                            fontSize: 12,
                                        }}
                                    >
                                        {value}
                                    </span>
                                )}
                            />

                            <Bar
                                dataKey="income"
                                name="Thu nhập"
                                fill="#0d9488"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={38}
                            />

                            <Bar
                                dataKey="expense"
                                name="Chi tiêu"
                                fill="#f59e0b"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={38}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

// ==========================================
// 2. BIỂU ĐỒ CHI TIÊU THEO DANH MỤC
// ==========================================

function CategoryChart({
    data,
}: {
    data: readonly CategoryExpense[];
}) {
    const validData = data.filter(
        (item) => item.amount > 0
    );

    const total = validData.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    return (
        <section
            aria-labelledby="category-chart-heading"
            className="min-w-0 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
        >
            <div className="mb-6">
                <h2
                    id="category-chart-heading"
                    className="text-lg font-bold text-foreground"
                >
                    Chi tiêu theo danh mục
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Phân bổ chi tiêu trong tháng hiện tại
                </p>
            </div>

            {validData.length === 0 ? (
                <ChartEmptyState
                    message="Chưa có khoản chi nào trong tháng để phân tích danh mục."
                />
            ) : (
                <>
                    <div className="relative h-[260px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <PieChart>
                                <Pie
                                    data={validData}
                                    dataKey="amount"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="62%"
                                    outerRadius="83%"
                                    paddingAngle={2}
                                    stroke="var(--card)"
                                    strokeWidth={2}
                                >
                                    {validData.map((item, index) => (
                                        <Cell
                                            key={item.category}
                                            fill={
                                                CATEGORY_COLORS[
                                                index % CATEGORY_COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--line)",
                                        borderRadius: 12,
                                        color: "var(--foreground)",
                                    }}
                                    labelStyle={{
                                        color: "var(--foreground)",
                                    }}
                                    itemStyle={{
                                        color: "var(--foreground)",
                                    }}
                                    formatter={(value, name) => [
                                        formatVND(Number(value ?? 0)),
                                        String(name),
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Tổng chi tiêu nằm giữa donut */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                                Tổng chi tiêu
                            </span>

                            <strong className="mt-1 text-base font-bold text-foreground sm:text-lg">
                                {compactVND(total)}
                            </strong>
                        </div>
                    </div>

                    {/* DANH SÁCH DANH MỤC */}
                    <div className="mt-5 space-y-3">
                        {validData.map((item, index) => (
                            <div
                                key={item.category}
                                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor:
                                                CATEGORY_COLORS[
                                                index % CATEGORY_COLORS.length
                                                ],
                                        }}
                                    />

                                    <span className="truncate text-sm font-medium text-foreground">
                                        {item.label}
                                    </span>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatVND(item.amount)}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {item.percentage}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

// ==========================================
// 3. THÀNH PHẦN DÙNG CHUNG
// ==========================================

export function FinanceCharts({
    monthly,
    categories,
}: FinanceChartsProps) {
    return (
        <div className="grid items-start gap-5 xl:grid-cols-2">
            <MonthlyTrendChart data={monthly} />
            <CategoryChart data={categories} />
        </div>
    );
}
