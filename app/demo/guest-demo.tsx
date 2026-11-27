
"use client";

import {
    useMemo,
    useState,
    type FormEvent,
} from "react";
import Link from "next/link";

import {
    GUEST_CATEGORY_LABELS,
    filterGuestTransactions,
    formatGuestVND,
    getGuestBudgetProgress,
    getGuestCategoryExpenses,
    getGuestMonthlyTrend,
    getGuestSummary,
    getGuestWishlistProgress,
    shiftGuestMonth,
    type GuestCategory,
    type GuestDemoState,
    type GuestExpenseCategory,
    type GuestPriority,
    type GuestTransactionFilters,
    type GuestTransactionType,
} from "@/lib/guest-demo-data";

// ==========================================
// FINANCE PLANNER V1.0 - INTERACTIVE DEMO
// ==========================================

type DemoTab =
    | "dashboard"
    | "transactions"
    | "budgets"
    | "wishlist";

type TransactionDraft = {
    date: string;
    type: GuestTransactionType;
    category: GuestCategory;
    description: string;
    amount: string;
};

type WishlistDraft = {
    name: string;
    cost: string;
    priority: GuestPriority;
};

type GuestDemoProps = {
    initialData: GuestDemoState;
    initialMonth: string;
};

const ALL_CATEGORIES = Object.keys(
    GUEST_CATEGORY_LABELS
) as GuestCategory[];

const EXPENSE_CATEGORIES =
    ALL_CATEGORIES.filter(
        (category): category is GuestExpenseCategory =>
            category !== "SALARY"
    );

const PRIORITY_LABELS = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
};

// ==========================================
// 1. HÀM TIỆN ÍCH
// ==========================================

function createTransactionDraft(
    month: string
): TransactionDraft {
    return {
        date: `${month}-01`,
        type: "EXPENSE",
        category: "FOOD",
        description: "",
        amount: "",
    };
}

function parsePositiveAmount(
    value: string
): number | null {
    if (!/^[1-9]\d*$/.test(value.trim())) {
        return null;
    }

    const amount = Number(value);

    return Number.isSafeInteger(amount) &&
        amount <= 2_147_483_647
        ? amount
        : null;
}

function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function newGuestId(): string {
    return (
        `guest-${Date.now()}-` +
        Math.random().toString(36).slice(2, 9)
    );
}

function ProgressBar({
    percentage,
    color = "bg-brand",
}: {
    percentage: number;
    color?: string;
}) {
    const width = Math.min(
        100,
        Math.max(0, percentage)
    );

    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(width)}
            aria-valuetext={`${Math.round(percentage)}%`}
            className="h-2.5 overflow-hidden rounded-full bg-muted"
        >
            <div
                className={`h-full rounded-full transition-[width] duration-300 ${color}`}
                style={{ width: `${width}%` }}
            />
        </div>
    );
}

const inputClass =
    "w-full min-w-0 rounded-xl border border-line " +
    "bg-card px-3 py-2.5 text-sm text-foreground " +
    "outline-none focus:border-brand focus:ring-2 " +
    "focus:ring-brand/20";

const buttonClass =
    "rounded-xl bg-brand px-4 py-2.5 text-sm " +
    "font-semibold text-white hover:opacity-90 " +
    "dark:text-background";

const secondaryButtonClass =
    "rounded-xl border border-line px-4 py-2.5 " +
    "text-sm font-medium text-foreground hover:bg-muted";

// ==========================================
// 2. GUEST DEMO COMPONENT
// ==========================================

export function GuestDemo({
    initialData,
    initialMonth,
}: GuestDemoProps) {
    const [state, setState] =
        useState<GuestDemoState>(initialData);

    const [tab, setTab] =
        useState<DemoTab>("dashboard");

    const [selectedMonth, setSelectedMonth] =
        useState(initialMonth);

    const [notice, setNotice] = useState(
        "Bạn đang dùng dữ liệu mô phỏng. Mọi thay đổi không được lưu vào Neon."
    );

    // Giao dịch
    const [filters, setFilters] =
        useState<GuestTransactionFilters>({
            month: initialMonth,
            type: "ALL",
            category: "ALL",
            q: "",
        });

    const [transactionDraft, setTransactionDraft] =
        useState<TransactionDraft>(
            createTransactionDraft(initialMonth)
        );

    const [
        editingTransactionId,
        setEditingTransactionId,
    ] = useState<string | null>(null);

    // Ngân sách
    const [budgetCategory, setBudgetCategory] =
        useState<GuestExpenseCategory>("FOOD");

    const [budgetLimit, setBudgetLimit] =
        useState("1000000");

    // Wishlist
    const [wishlistDraft, setWishlistDraft] =
        useState<WishlistDraft>({
            name: "",
            cost: "",
            priority: "MEDIUM",
        });

    const [
        editingWishlistId,
        setEditingWishlistId,
    ] = useState<string | null>(null);

    const [savingsInputs, setSavingsInputs] =
        useState<Record<string, string>>({});

    // ========================================
    // 3. DỮ LIỆU TÍNH TOÁN TỪ REACT STATE
    // ========================================

    const summary = useMemo(
        () => getGuestSummary(state.transactions),
        [state.transactions]
    );

    const trends = useMemo(
        () =>
            getGuestMonthlyTrend(
                state.transactions,
                initialMonth
            ),
        [state.transactions, initialMonth]
    );

    const categoryExpenses = useMemo(
        () =>
            getGuestCategoryExpenses(
                state.transactions,
                selectedMonth
            ),
        [state.transactions, selectedMonth]
    );

    const budgetProgress = useMemo(
        () =>
            getGuestBudgetProgress(
                state,
                selectedMonth
            ),
        [state, selectedMonth]
    );

    const filteredTransactions = useMemo(
        () =>
            filterGuestTransactions(
                state.transactions,
                filters
            ),
        [state.transactions, filters]
    );

    const months = Array.from(
        { length: 6 },
        (_, index) =>
            shiftGuestMonth(initialMonth, -index)
    );

    const maxChartValue = Math.max(
        1,
        ...trends.flatMap((item) => [
            item.income,
            item.expense,
        ])
    );

    // ========================================
    // 4. ĐẶT LẠI DỮ LIỆU DEMO
    // ========================================

    function resetDemo() {
        setState(initialData);
        setTab("dashboard");
        setSelectedMonth(initialMonth);

        setFilters({
            month: initialMonth,
            type: "ALL",
            category: "ALL",
            q: "",
        });

        setTransactionDraft(
            createTransactionDraft(initialMonth)
        );
        setEditingTransactionId(null);

        setBudgetCategory("FOOD");
        setBudgetLimit("1000000");

        setWishlistDraft({
            name: "",
            cost: "",
            priority: "MEDIUM",
        });
        setEditingWishlistId(null);
        setSavingsInputs({});

        setNotice(
            "Đã khôi phục toàn bộ dữ liệu mô phỏng ban đầu."
        );
    }

    // ========================================
    // 5. THÊM / SỬA GIAO DỊCH
    // ========================================

    function saveTransaction(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const amount = parsePositiveAmount(
            transactionDraft.amount
        );

        const description =
            transactionDraft.description.trim();

        if (
            amount === null ||
            description.length === 0 ||
            description.length > 200 ||
            !isValidDate(transactionDraft.date) ||
            (transactionDraft.type === "EXPENSE" &&
                transactionDraft.category === "SALARY")
        ) {
            setNotice(
                "Giao dịch không hợp lệ. Hãy kiểm tra ngày, mô tả và số tiền."
            );
            return;
        }

        const transaction = {
            id: editingTransactionId ?? newGuestId(),
            date: transactionDraft.date,
            type: transactionDraft.type,
            category: transactionDraft.category,
            description,
            amount,
        };

        setState((previous) => ({
            ...previous,
            transactions: editingTransactionId
                ? previous.transactions.map((item) =>
                    item.id === editingTransactionId
                        ? transaction
                        : item
                )
                : [
                    transaction,
                    ...previous.transactions,
                ],
        }));

        setNotice(
            editingTransactionId
                ? "Đã sửa giao dịch mô phỏng."
                : "Đã thêm giao dịch mô phỏng."
        );

        setEditingTransactionId(null);
        setTransactionDraft(
            createTransactionDraft(initialMonth)
        );
    }

    function editTransaction(
        id: string
    ) {
        const item = state.transactions.find(
            (transaction) => transaction.id === id
        );

        if (!item) return;

        setEditingTransactionId(id);

        setTransactionDraft({
            date: item.date,
            type: item.type,
            category: item.category,
            description: item.description,
            amount: String(item.amount),
        });

        setNotice(
            `Đang chỉnh sửa giao dịch: ${item.description}`
        );
    }

    function deleteTransaction(id: string) {
        setState((previous) => ({
            ...previous,
            transactions:
                previous.transactions.filter(
                    (item) => item.id !== id
                ),
        }));

        if (editingTransactionId === id) {
            setEditingTransactionId(null);
            setTransactionDraft(
                createTransactionDraft(initialMonth)
            );
        }

        setNotice("Đã xóa giao dịch mô phỏng.");
    }

    // ========================================
    // 6. TẠO / CẬP NHẬT NGÂN SÁCH
    // ========================================

    function saveBudget(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const limitAmount = parsePositiveAmount(
            budgetLimit
        );

        if (limitAmount === null) {
            setNotice(
                "Hạn mức phải là số nguyên dương hợp lệ."
            );
            return;
        }

        const id = newGuestId();

        setState((previous) => {
            const existing = previous.budgets.find(
                (item) =>
                    item.month === selectedMonth &&
                    item.category === budgetCategory
            );

            const budgets = existing
                ? previous.budgets.map((item) =>
                    item.id === existing.id
                        ? { ...item, limitAmount }
                        : item
                )
                : [
                    ...previous.budgets,
                    {
                        id,
                        month: selectedMonth,
                        category: budgetCategory,
                        limitAmount,
                    },
                ];

            return { ...previous, budgets };
        });

        setNotice(
            "Đã lưu hạn mức ngân sách mô phỏng."
        );
    }

    function deleteBudget(id: string) {
        setState((previous) => ({
            ...previous,
            budgets: previous.budgets.filter(
                (item) => item.id !== id
            ),
        }));

        setNotice("Đã xóa ngân sách mô phỏng.");
    }

    // ========================================
    // 7. TẠO / SỬA WISHLIST
    // ========================================

    function saveWishlist(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const cost = parsePositiveAmount(
            wishlistDraft.cost
        );

        const name = wishlistDraft.name.trim();

        const existing = state.wishlist.find(
            (item) => item.id === editingWishlistId
        );

        if (
            cost === null ||
            name.length === 0 ||
            name.length > 100
        ) {
            setNotice(
                "Vui lòng nhập tên và số tiền mục tiêu hợp lệ."
            );
            return;
        }

        if (
            existing &&
            cost < existing.savedAmount
        ) {
            setNotice(
                "Chi phí không được thấp hơn số tiền đã tiết kiệm."
            );
            return;
        }

        const item = {
            id: editingWishlistId ?? newGuestId(),
            name,
            cost,
            savedAmount: existing?.savedAmount ?? 0,
            priority: wishlistDraft.priority,
        };

        setState((previous) => ({
            ...previous,
            wishlist: editingWishlistId
                ? previous.wishlist.map((current) =>
                    current.id === editingWishlistId
                        ? item
                        : current
                )
                : [...previous.wishlist, item],
        }));

        setWishlistDraft({
            name: "",
            cost: "",
            priority: "MEDIUM",
        });

        setEditingWishlistId(null);
        setNotice("Đã lưu mục tiêu mô phỏng.");
    }

    function editWishlist(id: string) {
        const item = state.wishlist.find(
            (wish) => wish.id === id
        );

        if (!item) return;

        setEditingWishlistId(id);
        setWishlistDraft({
            name: item.name,
            cost: String(item.cost),
            priority: item.priority,
        });
    }

    function deleteWishlist(id: string) {
        setState((previous) => ({
            ...previous,
            wishlist: previous.wishlist.filter(
                (item) => item.id !== id
            ),
        }));

        if (editingWishlistId === id) {
            setEditingWishlistId(null);
            setWishlistDraft({
                name: "",
                cost: "",
                priority: "MEDIUM",
            });
        }

        setNotice("Đã xóa mục tiêu mô phỏng.");
    }

    // ========================================
    // 8. THÊM TIỀN TIẾT KIỆM
    // ========================================

    function addSavings(id: string) {
        const item = state.wishlist.find(
            (wish) => wish.id === id
        );

        if (!item) return;

        const amount = parsePositiveAmount(
            savingsInputs[id] ?? ""
        );

        const remaining =
            item.cost - item.savedAmount;

        if (
            amount === null ||
            amount > remaining
        ) {
            setNotice(
                "Số tiền thêm vào phải lớn hơn 0 và không vượt phần còn thiếu."
            );
            return;
        }

        const nextSavedAmount =
            item.savedAmount + amount;

        setState((previous) => ({
            ...previous,
            wishlist: previous.wishlist.map(
                (wish) =>
                    wish.id === id
                        ? {
                            ...wish,
                            savedAmount: nextSavedAmount,
                        }
                        : wish
            ),
        }));

        setSavingsInputs((previous) => ({
            ...previous,
            [id]: "",
        }));

        const percentage =
            (nextSavedAmount / item.cost) * 100;

        setNotice(
            percentage >= 100
                ? "Mục tiêu mô phỏng đã đạt 100%!"
                : `Đã thêm tiền. Tiến độ hiện tại: ${Math.round(percentage)}%.`
        );
    }

    // ========================================
    // 9. GIAO DIỆN
    // ========================================

    return (
        <main className="mx-auto max-w-7xl space-y-7 px-5 py-9 sm:px-8 sm:py-12">

            {/* HEADER */}
            <header className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-brand hover:underline"
                    >
                        ← Về trang chủ
                    </Link>

                    <span className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                        Finance Planner · v1.0 · DEMO
                    </span>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                            Trải nghiệm Finance Planner
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                            Thử quản lý giao dịch, ngân sách,
                            báo cáo và mục tiêu tiết kiệm
                            mà không cần đăng nhập.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={resetDemo}
                            className={secondaryButtonClass}
                        >
                            Đặt lại dữ liệu mẫu
                        </button>

                        <Link
                            href="/register"
                            className={buttonClass}
                        >
                            Tạo tài khoản
                        </Link>
                    </div>
                </div>
            </header>

            {/* THÔNG BÁO AN TOÀN */}
            <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-foreground"
            >
                <strong>Chế độ dùng thử:</strong>{" "}
                {notice}
            </div>

            {/* MENU DEMO */}
            <nav
                aria-label="Các chức năng dùng thử"
                className="flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-2"
            >
                {(
                    [
                        ["dashboard", "Dashboard"],
                        ["transactions", "Giao dịch"],
                        ["budgets", "Ngân sách"],
                        ["wishlist", "Wishlist"],
                    ] as const
                ).map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={tab === value}
                        onClick={() => setTab(value)}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${tab === value
                                ? "bg-brand text-white dark:text-background"
                                : "text-foreground hover:bg-muted"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            {/* ====================================
          TAB 1 - DASHBOARD
      ==================================== */}
            {tab === "dashboard" && (
                <div className="space-y-6">
                    <section className="grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                title: "Số dư",
                                value: summary.balance,
                            },
                            {
                                title: "Tổng thu",
                                value: summary.totalIncome,
                            },
                            {
                                title: "Tổng chi",
                                value: summary.totalExpense,
                            },
                        ].map((item) => (
                            <article
                                key={item.title}
                                className="rounded-2xl border border-line bg-card p-5"
                            >
                                <p className="text-sm text-muted-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-3 break-all text-2xl font-bold tabular-nums text-foreground">
                                    {formatGuestVND(item.value)}
                                </p>
                            </article>
                        ))}
                    </section>

                    {/* BIỂU ĐỒ 6 THÁNG */}
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Xu hướng thu chi 6 tháng
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Biểu đồ tự cập nhật khi bạn thêm,
                            sửa hoặc xóa giao dịch mẫu.
                        </p>

                        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                            <span>🟢 Thu nhập</span>
                            <span>🔴 Chi tiêu</span>
                        </div>

                        <div
                            role="img"
                            aria-label="Biểu đồ cột thu nhập và chi tiêu trong 6 tháng"
                            className="mt-7 grid grid-cols-6 gap-2 sm:gap-4"
                        >
                            {trends.map((item) => (
                                <div
                                    key={item.month}
                                    className="min-w-0"
                                >
                                    <div className="flex h-44 items-end justify-center gap-1.5 border-b border-line">
                                        <div
                                            title={`Thu: ${formatGuestVND(item.income)}`}
                                            className="w-1/2 max-w-7 rounded-t-md bg-emerald-500"
                                            style={{
                                                height: `${(item.income / maxChartValue) * 100
                                                    }%`,
                                            }}
                                        />

                                        <div
                                            title={`Chi: ${formatGuestVND(item.expense)}`}
                                            className="w-1/2 max-w-7 rounded-t-md bg-rose-400"
                                            style={{
                                                height: `${(item.expense / maxChartValue) * 100
                                                    }%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-center text-xs text-muted-foreground">
                                        T{Number(item.month.slice(5))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* TỔNG QUAN NGÂN SÁCH */}
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-foreground">
                                Ngân sách tháng hiện tại
                            </h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedMonth(initialMonth);
                                    setTab("budgets");
                                }}
                                className="text-sm font-semibold text-brand hover:underline"
                            >
                                Quản lý ngân sách
                            </button>
                        </div>

                        <div className="mt-6 space-y-5">
                            {getGuestBudgetProgress(
                                state,
                                initialMonth
                            ).map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-foreground">
                                            {
                                                GUEST_CATEGORY_LABELS[
                                                item.category
                                                ]
                                            }
                                        </span>

                                        <span className="text-sm font-semibold text-foreground">
                                            {Math.round(item.percentage)}%
                                        </span>
                                    </div>

                                    <ProgressBar
                                        percentage={item.percentage}
                                        color={
                                            item.status === "over" ||
                                                item.status === "limit"
                                                ? "bg-rose-500"
                                                : item.status === "warning"
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-500"
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CHI TIÊU THEO DANH MỤC */}
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Chi tiêu theo danh mục
                        </h2>

                        <div className="mt-5 space-y-3">
                            {categoryExpenses.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Tháng này chưa có chi tiêu.
                                </p>
                            ) : (
                                categoryExpenses.map((item) => (
                                    <div
                                        key={item.category}
                                        className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0"
                                    >
                                        <span className="text-sm text-foreground">
                                            {item.label}
                                        </span>

                                        <strong className="text-sm tabular-nums text-foreground">
                                            {formatGuestVND(item.amount)}
                                        </strong>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}

            {/* ====================================
          TAB 2 - GIAO DỊCH
      ==================================== */}
            {tab === "transactions" && (
                <div className="space-y-6">
                    {/* FORM THÊM / SỬA */}
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {editingTransactionId
                                ? "Chỉnh sửa giao dịch"
                                : "Thêm giao dịch mô phỏng"}
                        </h2>

                        <form
                            onSubmit={saveTransaction}
                            className="mt-5 grid gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label
                                    htmlFor="guest-date"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Ngày giao dịch
                                </label>
                                <input
                                    id="guest-date"
                                    type="date"
                                    required
                                    value={transactionDraft.date}
                                    onChange={(event) =>
                                        setTransactionDraft(
                                            (previous) => ({
                                                ...previous,
                                                date: event.target.value,
                                            })
                                        )
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="guest-type"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Loại giao dịch
                                </label>
                                <select
                                    id="guest-type"
                                    value={transactionDraft.type}
                                    onChange={(event) => {
                                        const type =
                                            event.target.value as GuestTransactionType;

                                        setTransactionDraft(
                                            (previous) => ({
                                                ...previous,
                                                type,
                                                category:
                                                    type === "INCOME"
                                                        ? "SALARY"
                                                        : "FOOD",
                                            })
                                        );
                                    }}
                                    className={inputClass}
                                >
                                    <option value="INCOME">
                                        Thu nhập
                                    </option>
                                    <option value="EXPENSE">
                                        Chi tiêu
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="guest-category"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Danh mục
                                </label>
                                <select
                                    id="guest-category"
                                    value={transactionDraft.category}
                                    onChange={(event) =>
                                        setTransactionDraft(
                                            (previous) => ({
                                                ...previous,
                                                category:
                                                    event.target.value as GuestCategory,
                                            })
                                        )
                                    }
                                    className={inputClass}
                                >
                                    {(transactionDraft.type === "INCOME"
                                        ? ALL_CATEGORIES
                                        : EXPENSE_CATEGORIES
                                    ).map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {GUEST_CATEGORY_LABELS[category]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="guest-amount"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Số tiền (VND)
                                </label>
                                <input
                                    id="guest-amount"
                                    type="number"
                                    min="1"
                                    max="2147483647"
                                    step="1"
                                    required
                                    placeholder="Ví dụ: 150000"
                                    value={transactionDraft.amount}
                                    onChange={(event) =>
                                        setTransactionDraft(
                                            (previous) => ({
                                                ...previous,
                                                amount: event.target.value,
                                            })
                                        )
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="guest-description"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Mô tả
                                </label>
                                <input
                                    id="guest-description"
                                    maxLength={200}
                                    required
                                    placeholder="Ví dụ: Ăn trưa"
                                    value={transactionDraft.description}
                                    onChange={(event) =>
                                        setTransactionDraft(
                                            (previous) => ({
                                                ...previous,
                                                description: event.target.value,
                                            })
                                        )
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 sm:col-span-2">
                                <button
                                    type="submit"
                                    className={buttonClass}
                                >
                                    {editingTransactionId
                                        ? "Lưu thay đổi"
                                        : "Thêm giao dịch"}
                                </button>

                                {editingTransactionId && (
                                    <button
                                        type="button"
                                        className={secondaryButtonClass}
                                        onClick={() => {
                                            setEditingTransactionId(null);
                                            setTransactionDraft(
                                                createTransactionDraft(
                                                    initialMonth
                                                )
                                            );
                                        }}
                                    >
                                        Hủy chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* BỘ LỌC */}
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Tìm kiếm và bộ lọc
                        </h2>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <input
                                aria-label="Tìm kiếm mô tả"
                                placeholder="Tìm mô tả..."
                                value={filters.q}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        q: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            />

                            <select
                                aria-label="Lọc theo tháng"
                                value={filters.month}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        month: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            >
                                <option value="all">
                                    Tất cả thời gian
                                </option>
                                {months.map((month) => (
                                    <option key={month} value={month}>
                                        Tháng {month.slice(5)}/{month.slice(0, 4)}
                                    </option>
                                ))}
                            </select>

                            <select
                                aria-label="Lọc loại giao dịch"
                                value={filters.type}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        type:
                                            event.target.value as GuestTransactionFilters["type"],
                                    }))
                                }
                                className={inputClass}
                            >
                                <option value="ALL">Tất cả loại</option>
                                <option value="INCOME">Thu nhập</option>
                                <option value="EXPENSE">Chi tiêu</option>
                            </select>

                            <select
                                aria-label="Lọc danh mục"
                                value={filters.category}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        category:
                                            event.target.value as GuestTransactionFilters["category"],
                                    }))
                                }
                                className={inputClass}
                            >
                                <option value="ALL">
                                    Tất cả danh mục
                                </option>
                                {ALL_CATEGORIES.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {GUEST_CATEGORY_LABELS[category]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* DANH SÁCH GIAO DỊCH */}
                    <section className="overflow-hidden rounded-2xl border border-line bg-card">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
                            <h2 className="text-lg font-bold text-foreground">
                                Danh sách giao dịch
                            </h2>

                            <span className="text-sm text-muted-foreground">
                                {filteredTransactions.length} giao dịch
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        {[
                                            "Ngày",
                                            "Mô tả",
                                            "Danh mục",
                                            "Số tiền",
                                            "Thao tác",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-4 py-3 font-semibold text-foreground"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-line">
                                    {filteredTransactions.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.date}
                                            </td>

                                            <td className="px-4 py-3 text-foreground">
                                                {item.description}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {GUEST_CATEGORY_LABELS[item.category]}
                                            </td>

                                            <td
                                                className={`px-4 py-3 font-semibold tabular-nums ${item.type === "INCOME"
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-rose-600 dark:text-rose-400"
                                                    }`}
                                            >
                                                {item.type === "INCOME" ? "+" : "-"}
                                                {formatGuestVND(item.amount)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editTransaction(item.id)
                                                        }
                                                        className="font-semibold text-brand hover:underline"
                                                    >
                                                        Sửa
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteTransaction(item.id)
                                                        }
                                                        className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-10 text-center text-muted-foreground"
                                            >
                                                Không có giao dịch phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {/* ====================================
          TAB 3 - NGÂN SÁCH
      ==================================== */}
            {tab === "budgets" && (
                <div className="space-y-6">
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            Thiết lập ngân sách mô phỏng
                        </h2>

                        <div className="mt-4">
                            <label
                                htmlFor="guest-budget-month"
                                className="mb-2 block text-sm font-medium"
                            >
                                Chọn tháng
                            </label>

                            <select
                                id="guest-budget-month"
                                value={selectedMonth}
                                onChange={(event) =>
                                    setSelectedMonth(event.target.value)
                                }
                                className={inputClass}
                            >
                                {months.map((month) => (
                                    <option
                                        key={month}
                                        value={month}
                                    >
                                        Tháng {month.slice(5)}/{month.slice(0, 4)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <form
                            onSubmit={saveBudget}
                            className="mt-5 grid gap-3 sm:grid-cols-3"
                        >
                            <select
                                aria-label="Danh mục ngân sách"
                                value={budgetCategory}
                                onChange={(event) =>
                                    setBudgetCategory(
                                        event.target.value as GuestExpenseCategory
                                    )
                                }
                                className={inputClass}
                            >
                                {EXPENSE_CATEGORIES.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {GUEST_CATEGORY_LABELS[category]}
                                    </option>
                                ))}
                            </select>

                            <input
                                aria-label="Hạn mức ngân sách"
                                type="number"
                                min="1"
                                step="1"
                                required
                                placeholder="Hạn mức VND"
                                value={budgetLimit}
                                onChange={(event) =>
                                    setBudgetLimit(event.target.value)
                                }
                                className={inputClass}
                            />

                            <button
                                type="submit"
                                className={buttonClass}
                            >
                                Lưu hạn mức
                            </button>
                        </form>

                        <p className="mt-3 text-xs text-muted-foreground">
                            Nếu danh mục đã có ngân sách trong
                            tháng, hạn mức sẽ được cập nhật.
                        </p>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                        {budgetProgress.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-line bg-card p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-bold text-foreground">
                                        {GUEST_CATEGORY_LABELS[item.category]}
                                    </h3>

                                    <span
                                        className={`text-xs font-semibold ${item.status === "over" ||
                                                item.status === "limit"
                                                ? "text-rose-600 dark:text-rose-400"
                                                : item.status === "warning"
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                    >
                                        {item.status === "over"
                                            ? "Vượt ngân sách"
                                            : item.status === "limit"
                                                ? "Hết hạn mức"
                                                : item.status === "warning"
                                                    ? "Sắp đạt hạn mức"
                                                    : "Trong hạn mức"}
                                    </span>
                                </div>

                                <p className="mt-4 text-sm text-muted-foreground">
                                    Đã chi: {formatGuestVND(item.spentAmount)}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Hạn mức: {formatGuestVND(item.limitAmount)}
                                </p>

                                <div className="mt-4 space-y-2">
                                    <div className="text-right text-sm font-semibold">
                                        {Math.round(item.percentage)}%
                                    </div>

                                    <ProgressBar
                                        percentage={item.percentage}
                                        color={
                                            item.status === "over" ||
                                                item.status === "limit"
                                                ? "bg-rose-500"
                                                : item.status === "warning"
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-500"
                                        }
                                    />
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBudgetCategory(item.category);
                                            setBudgetLimit(
                                                String(item.limitAmount)
                                            );
                                            setNotice(
                                                "Hạn mức đã được đưa vào form. Hãy sửa số tiền và nhấn Lưu."
                                            );
                                        }}
                                        className={secondaryButtonClass}
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteBudget(item.id)
                                        }
                                        className="rounded-xl border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </article>
                        ))}

                        {budgetProgress.length === 0 && (
                            <div className="rounded-xl border border-dashed border-line p-8 text-center text-muted-foreground lg:col-span-2">
                                Tháng này chưa thiết lập ngân sách.
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* ====================================
          TAB 4 - WISHLIST
      ==================================== */}
            {tab === "wishlist" && (
                <div className="space-y-6">
                    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {editingWishlistId
                                ? "Chỉnh sửa mục tiêu"
                                : "Thêm mục tiêu tiết kiệm"}
                        </h2>

                        <form
                            onSubmit={saveWishlist}
                            className="mt-5 grid gap-3 sm:grid-cols-2"
                        >
                            <input
                                aria-label="Tên mục tiêu"
                                placeholder="Tên mục tiêu"
                                required
                                maxLength={100}
                                value={wishlistDraft.name}
                                onChange={(event) =>
                                    setWishlistDraft(
                                        (previous) => ({
                                            ...previous,
                                            name: event.target.value,
                                        })
                                    )
                                }
                                className={inputClass}
                            />

                            <input
                                aria-label="Chi phí mục tiêu"
                                type="number"
                                min="1"
                                step="1"
                                required
                                placeholder="Chi phí mục tiêu (VND)"
                                value={wishlistDraft.cost}
                                onChange={(event) =>
                                    setWishlistDraft(
                                        (previous) => ({
                                            ...previous,
                                            cost: event.target.value,
                                        })
                                    )
                                }
                                className={inputClass}
                            />

                            <select
                                aria-label="Mức ưu tiên"
                                value={wishlistDraft.priority}
                                onChange={(event) =>
                                    setWishlistDraft(
                                        (previous) => ({
                                            ...previous,
                                            priority:
                                                event.target.value as GuestPriority,
                                        })
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="LOW">Ưu tiên thấp</option>
                                <option value="MEDIUM">Ưu tiên trung bình</option>
                                <option value="HIGH">Ưu tiên cao</option>
                            </select>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    className={buttonClass}
                                >
                                    {editingWishlistId
                                        ? "Lưu thay đổi"
                                        : "Thêm mục tiêu"}
                                </button>

                                {editingWishlistId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingWishlistId(null);
                                            setWishlistDraft({
                                                name: "",
                                                cost: "",
                                                priority: "MEDIUM",
                                            });
                                        }}
                                        className={secondaryButtonClass}
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                        {state.wishlist.map((item) => {
                            const progress =
                                getGuestWishlistProgress(item);

                            return (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-line bg-card p-5 sm:p-6"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {item.name}
                                        </h3>

                                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                            {PRIORITY_LABELS[item.priority]}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Đã tiết kiệm:{" "}
                                        <strong className="text-foreground">
                                            {formatGuestVND(item.savedAmount)}
                                        </strong>
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Mục tiêu: {formatGuestVND(item.cost)}
                                    </p>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Tiến độ</span>
                                            <strong>
                                                {Math.round(progress.percentage)}%
                                            </strong>
                                        </div>

                                        <ProgressBar
                                            percentage={progress.percentage}
                                        />
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {progress.completed
                                            ? "Đã hoàn thành mục tiêu!"
                                            : `Còn thiếu ${formatGuestVND(progress.remaining)}`}
                                    </p>

                                    {!progress.completed && (
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <input
                                                aria-label={`Thêm tiền cho ${item.name}`}
                                                type="number"
                                                min="1"
                                                max={progress.remaining}
                                                step="1"
                                                placeholder="Số tiền thêm"
                                                value={savingsInputs[item.id] ?? ""}
                                                onChange={(event) =>
                                                    setSavingsInputs(
                                                        (previous) => ({
                                                            ...previous,
                                                            [item.id]:
                                                                event.target.value,
                                                        })
                                                    )
                                                }
                                                className={`${inputClass} flex-1`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addSavings(item.id)
                                                }
                                                className={buttonClass}
                                            >
                                                Thêm tiền
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                editWishlist(item.id)
                                            }
                                            className={secondaryButtonClass}
                                        >
                                            Sửa mục tiêu
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteWishlist(item.id)
                                            }
                                            className="rounded-xl border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </article>
                            );
                        })}

                        {state.wishlist.length === 0 && (
                            <div className="rounded-xl border border-dashed border-line p-8 text-center text-muted-foreground lg:col-span-2">
                                Chưa có mục tiêu tiết kiệm.
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* FOOTER DEMO */}
            <footer className="rounded-2xl border border-line bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">
                    Đây là chế độ mô phỏng. Dữ liệu không
                    được lưu và sẽ trở về ban đầu khi tải
                    lại trang.
                </p>

                <Link
                    href="/register"
                    className="mt-4 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:opacity-90 dark:text-background"
                >
                    Đăng ký để sử dụng với dữ liệu của bạn
                </Link>
            </footer>
        </main>
    );
}
