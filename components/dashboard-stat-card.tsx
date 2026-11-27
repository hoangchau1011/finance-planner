
import type { ReactNode } from "react";

// ==========================================
// FINANCE PLANNER V1.0
// DASHBOARD STAT CARD
// ==========================================

export type DashboardStatKind =
    | "balance"
    | "income"
    | "expense";

type DashboardStatCardProps = {
    title: string;
    value: string;
    description: string;
    kind: DashboardStatKind;
    footer?: ReactNode;
};

// ==========================================
// 1. MÀU SẮC THEO LOẠI THỐNG KÊ
// ==========================================

const statStyles = {
    balance: {
        iconBackground: "bg-brand/10",
        iconColor: "text-brand",
        accent: "bg-brand",
        valueColor: "text-foreground",
        label: "Số dư tài khoản",
    },

    income: {
        iconBackground:
            "bg-emerald-500/10",
        iconColor:
            "text-emerald-600 dark:text-emerald-400",
        accent: "bg-emerald-500",
        valueColor:
            "text-emerald-700 dark:text-emerald-400",
        label: "Thu nhập",
    },

    expense: {
        iconBackground: "bg-rose-500/10",
        iconColor:
            "text-rose-600 dark:text-rose-400",
        accent: "bg-rose-500",
        valueColor:
            "text-rose-700 dark:text-rose-400",
        label: "Chi tiêu",
    },
} as const;

// ==========================================
// 2. ICON SVG
// Không cần lucide-react hoặc package mới.
// ==========================================

function StatIcon({
    kind,
}: {
    kind: DashboardStatKind;
}) {
    const iconClass =
        "h-6 w-6";

    if (kind === "balance") {
        return (
            <svg
                aria-hidden="true"
                className={iconClass}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 7V5a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                <path d="M3 7h17" />
                <path d="M16 14h2" />
            </svg>
        );
    }

    if (kind === "income") {
        return (
            <svg
                aria-hidden="true"
                className={iconClass}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m3 17 6-6 4 4 8-8" />
                <path d="M15 7h6v6" />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            className={iconClass}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 7 6 6 4-4 8 8" />
            <path d="M15 17h6v-6" />
        </svg>
    );
}

// ==========================================
// 3. COMPONENT THẺ THỐNG KÊ
// ==========================================

export function DashboardStatCard({
    title,
    value,
    description,
    kind,
    footer,
}: DashboardStatCardProps) {
    const style = statStyles[kind];

    return (
        <article
            aria-label={style.label}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
        >
            {/* VẠCH MÀU PHÍA TRÊN */}
            <div
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1 ${style.accent}`}
            />

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>

                {/* ICON */}
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.iconBackground} ${style.iconColor}`}
                >
                    <StatIcon kind={kind} />
                </div>
            </div>

            {/* GIÁ TRỊ TÀI CHÍNH */}
            <div className="mt-6">
                <p
                    className={`break-words text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${style.valueColor}`}
                >
                    {value}
                </p>
            </div>

            {/* FOOTER TÙY CHỌN */}
            {footer && (
                <div className="mt-5 border-t border-line pt-4">
                    <div className="text-xs text-muted-foreground">
                        {footer}
                    </div>
                </div>
            )}
        </article>
    );
}
