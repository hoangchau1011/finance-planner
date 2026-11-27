
// ==========================================
// FINANCE PLANNER V1.0
// GUEST DEMO - ISOLATED MOCK DATA
// ==========================================

// Dữ liệu trong file này hoàn toàn giả lập.
// Không import Prisma, Better Auth hoặc Neon.

// ==========================================
// 1. DANH MỤC VÀ KIỂU DỮ LIỆU
// ==========================================

export const GUEST_CATEGORY_LABELS = {
    SALARY: "Lương",
    FOOD: "Ăn uống",
    TRANSPORT: "Di chuyển",
    ENTERTAINMENT: "Giải trí",
    SHOPPING: "Mua sắm",
    BILLS: "Hóa đơn",
    INVESTMENT: "Đầu tư",
    OTHER: "Khác",
} as const;

export type GuestCategory =
    keyof typeof GUEST_CATEGORY_LABELS;

export type GuestTransactionType =
    | "INCOME"
    | "EXPENSE";

export type GuestPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH";

export type GuestExpenseCategory =
    Exclude<GuestCategory, "SALARY">;

export type GuestTransaction = {
    id: string;
    date: string; // YYYY-MM-DD
    type: GuestTransactionType;
    category: GuestCategory;
    description: string;
    amount: number;
};

export type GuestBudget = {
    id: string;
    month: string; // YYYY-MM
    category: GuestExpenseCategory;
    limitAmount: number;
};

export type GuestWishlistItem = {
    id: string;
    name: string;
    cost: number;
    savedAmount: number;
    priority: GuestPriority;
};

export type GuestDemoState = {
    transactions: GuestTransaction[];
    budgets: GuestBudget[];
    wishlist: GuestWishlistItem[];
};

// ==========================================
// 2. XỬ LÝ THÁNG THEO GIỜ VIỆT NAM
// ==========================================

export function getGuestMonthKey(
    date: Date = new Date()
): string {
    const parts = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
        }
    ).formatToParts(date);

    const year = parts.find(
        (part) => part.type === "year"
    )?.value;

    const month = parts.find(
        (part) => part.type === "month"
    )?.value;

    return `${year}-${month}`;
}

export function shiftGuestMonth(
    month: string,
    offset: number
): string {
    const [year, monthNumber] =
        month.split("-").map(Number);

    const date = new Date(
        Date.UTC(year, monthNumber - 1 + offset, 1)
    );

    return (
        `${date.getUTCFullYear()}-` +
        `${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    );
}

function getGuestTodayDay(
    date: Date
): number {
    return Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
        }).format(date)
    );
}

// ==========================================
// 3. GIAO DỊCH MẪU
// ==========================================

type TransactionTemplate = {
    day: number;
    type: GuestTransactionType;
    category: GuestCategory;
    description: string;
    amount: number;
};

const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
    {
        day: 2,
        type: "INCOME",
        category: "SALARY",
        description: "Lương tháng",
        amount: 16000000,
    },
    {
        day: 4,
        type: "EXPENSE",
        category: "FOOD",
        description: "Đi siêu thị",
        amount: 650000,
    },
    {
        day: 6,
        type: "EXPENSE",
        category: "TRANSPORT",
        description: "Xăng xe",
        amount: 280000,
    },
    {
        day: 8,
        type: "EXPENSE",
        category: "BILLS",
        description: "Tiền điện nước",
        amount: 950000,
    },
    {
        day: 10,
        type: "INCOME",
        category: "OTHER",
        description: "Thu nhập làm thêm",
        amount: 2500000,
    },
    {
        day: 12,
        type: "EXPENSE",
        category: "FOOD",
        description: "Ăn uống cuối tuần",
        amount: 720000,
    },
    {
        day: 15,
        type: "EXPENSE",
        category: "SHOPPING",
        description: "Mua quần áo",
        amount: 1350000,
    },
    {
        day: 17,
        type: "EXPENSE",
        category: "TRANSPORT",
        description: "Di chuyển trong thành phố",
        amount: 400000,
    },
    {
        day: 19,
        type: "EXPENSE",
        category: "ENTERTAINMENT",
        description: "Xem phim và giải trí",
        amount: 350000,
    },
    {
        day: 21,
        type: "EXPENSE",
        category: "FOOD",
        description: "Mua thực phẩm",
        amount: 580000,
    },
    {
        day: 23,
        type: "EXPENSE",
        category: "BILLS",
        description: "Internet và điện thoại",
        amount: 300000,
    },
    {
        day: 25,
        type: "EXPENSE",
        category: "INVESTMENT",
        description: "Khoản đầu tư cá nhân",
        amount: 1000000,
    },
];

function createMonthTransactions(
    month: string,
    monthOffset: number,
    maxDay = 25
): GuestTransaction[] {
    return TRANSACTION_TEMPLATES.map(
        (template, index) => {
            // Điều chỉnh một chút số tiền giữa các
            // tháng để biểu đồ không bị giống nhau.
            const multiplier =
                monthOffset === 0
                    ? 1
                    : 1 - Math.abs(monthOffset) * 0.025;

            const amount =
                template.type === "INCOME"
                    ? template.amount
                    : Math.round(
                        (template.amount * multiplier) / 1000
                    ) * 1000;

            const day = Math.min(
                template.day,
                maxDay
            );

            return {
                id:
                    `guest-${month.replace("-", "")}-` +
                    `${index + 1}`,

                date:
                    `${month}-` +
                    `${String(day).padStart(2, "0")}`,

                type: template.type,
                category: template.category,
                description: template.description,
                amount,
            };
        }
    );
}

// ==========================================
// 4. KHỞI TẠO DỮ LIỆU DEMO
// ==========================================

// Mỗi lần gọi tạo ra một bộ dữ liệu mới.
// Không sử dụng dữ liệu hay tài khoản thật.

export function createGuestDemoState(
    referenceDate: Date = new Date()
): GuestDemoState {
    const month = getGuestMonthKey(
        referenceDate
    );

    const todayDay = getGuestTodayDay(
        referenceDate
    );

    // Tạo dữ liệu tháng hiện tại và
    // 5 tháng trước để phục vụ biểu đồ.
    const transactions =
        Array.from({ length: 6 }, (_, index) => {
            const targetMonth = shiftGuestMonth(
                month,
                -index
            );

            return createMonthTransactions(
                targetMonth,
                -index,
                index === 0
                    ? Math.min(todayDay, 25)
                    : 25
            );
        }).flat();

    const budgets: GuestBudget[] = [
        {
            id: "guest-budget-food",
            month,
            category: "FOOD",
            limitAmount: 2200000,
        },
        {
            id: "guest-budget-transport",
            month,
            category: "TRANSPORT",
            limitAmount: 1000000,
        },
        {
            id: "guest-budget-shopping",
            month,
            category: "SHOPPING",
            limitAmount: 1200000,
        },
        {
            id: "guest-budget-bills",
            month,
            category: "BILLS",
            limitAmount: 1500000,
        },
        {
            id: "guest-budget-entertainment",
            month,
            category: "ENTERTAINMENT",
            limitAmount: 800000,
        },
    ];

    const wishlist: GuestWishlistItem[] = [
        {
            id: "guest-wishlist-laptop",
            name: "Mua laptop mới",
            cost: 15000000,
            savedAmount: 9000000,
            priority: "HIGH",
        },
        {
            id: "guest-wishlist-travel",
            name: "Du lịch Đà Lạt",
            cost: 6000000,
            savedAmount: 1500000,
            priority: "MEDIUM",
        },
        {
            id: "guest-wishlist-course",
            name: "Khóa học nâng cao",
            cost: 4000000,
            savedAmount: 3200000,
            priority: "LOW",
        },
    ];

    return {
        transactions,
        budgets,
        wishlist,
    };
}

// ==========================================
// 5. TÍNH TỔNG QUAN TÀI CHÍNH
// ==========================================

export function getGuestSummary(
    transactions: GuestTransaction[]
) {
    const totalIncome = transactions
        .filter((item) => item.type === "INCOME")
        .reduce(
            (sum, item) => sum + item.amount,
            0
        );

    const totalExpense = transactions
        .filter((item) => item.type === "EXPENSE")
        .reduce(
            (sum, item) => sum + item.amount,
            0
        );

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
    };
}

// ==========================================
// 6. TỔNG HỢP XU HƯỚNG 6 THÁNG
// ==========================================

export function getGuestMonthlyTrend(
    transactions: GuestTransaction[],
    currentMonth: string,
    monthCount = 6
) {
    return Array.from(
        { length: monthCount },
        (_, index) => {
            const month = shiftGuestMonth(
                currentMonth,
                index - monthCount + 1
            );

            const records = transactions.filter(
                (item) =>
                    item.date.startsWith(month)
            );

            const summary = getGuestSummary(
                records
            );

            return {
                month,
                income: summary.totalIncome,
                expense: summary.totalExpense,
                balance: summary.balance,
            };
        }
    );
}

// ==========================================
// 7. TÍNH CHI TIÊU THEO DANH MỤC
// ==========================================

export function getGuestCategoryExpenses(
    transactions: GuestTransaction[],
    month: string
) {
    const expenses = transactions.filter(
        (item) =>
            item.type === "EXPENSE" &&
            item.date.startsWith(month)
    );

    const totals =
        new Map<GuestCategory, number>();

    for (const item of expenses) {
        totals.set(
            item.category,
            (totals.get(item.category) ?? 0) +
            item.amount
        );
    }

    return [...totals.entries()]
        .map(([category, amount]) => ({
            category,
            label: GUEST_CATEGORY_LABELS[category],
            amount,
        }))
        .sort(
            (a, b) => b.amount - a.amount
        );
}

// ==========================================
// 8. TIẾN ĐỘ NGÂN SÁCH
// ==========================================

export function getGuestBudgetProgress(
    state: GuestDemoState,
    month: string
) {
    const expenses =
        getGuestCategoryExpenses(
            state.transactions,
            month
        );

    const spentMap = new Map(
        expenses.map((item) => [
            item.category,
            item.amount,
        ])
    );

    return state.budgets
        .filter((budget) =>
            budget.month === month
        )
        .map((budget) => {
            const spentAmount =
                spentMap.get(budget.category) ?? 0;

            const percentage =
                budget.limitAmount > 0
                    ? (spentAmount / budget.limitAmount) *
                    100
                    : 0;

            const status =
                percentage > 100
                    ? "over"
                    : percentage >= 100
                        ? "limit"
                        : percentage >= 80
                            ? "warning"
                            : "ok";

            return {
                ...budget,
                spentAmount,
                remaining:
                    budget.limitAmount -
                    spentAmount,
                percentage,
                status,
            };
        });
}

// ==========================================
// 9. TIẾN ĐỘ WISHLIST
// ==========================================

export function getGuestWishlistProgress(
    item: GuestWishlistItem
) {
    const percentage =
        item.cost > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (item.savedAmount / item.cost) * 100
                )
            )
            : 0;

    return {
        ...item,
        percentage,
        remaining: Math.max(
            0,
            item.cost - item.savedAmount
        ),
        completed:
            item.savedAmount >= item.cost,
    };
}

// ==========================================
// 10. LỌC VÀ TÌM KIẾM GIAO DỊCH
// ==========================================

export type GuestTransactionFilters = {
    month: string | "all";
    type: GuestTransactionType | "ALL";
    category: GuestCategory | "ALL";
    q: string;
};

export function filterGuestTransactions(
    transactions: GuestTransaction[],
    filters: GuestTransactionFilters
): GuestTransaction[] {
    const query = filters.q
        .trim()
        .toLocaleLowerCase("vi-VN");

    return transactions
        .filter((item) => {
            if (
                filters.month !== "all" &&
                !item.date.startsWith(
                    filters.month
                )
            ) {
                return false;
            }

            if (
                filters.type !== "ALL" &&
                item.type !== filters.type
            ) {
                return false;
            }

            if (
                filters.category !== "ALL" &&
                item.category !== filters.category
            ) {
                return false;
            }

            if (
                query &&
                !item.description
                    .toLocaleLowerCase("vi-VN")
                    .includes(query)
            ) {
                return false;
            }

            return true;
        })
        .sort((a, b) =>
            b.date.localeCompare(a.date) ||
            b.id.localeCompare(a.id)
        );
}

// ==========================================
// 11. ĐỊNH DẠNG TIỀN DEMO
// ==========================================

export function formatGuestVND(
    amount: number
): string {
    return (
        new Intl.NumberFormat("vi-VN", {
            maximumFractionDigits: 0,
        }).format(amount) + " đ"
    );
}
