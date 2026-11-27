
"use client";

import type { FormEvent } from "react";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

import { CATEGORY_LABELS } from "@/lib/finance";
import { parseTransactionFilters } from "@/lib/validation";

// ==========================================
// FINANCE PLANNER V1.0
// TRANSACTION FILTERS & SEARCH
// ==========================================

type FilterKey =
    | "range"
    | "type"
    | "category"
    | "q";

export function TransactionFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Đọc bộ lọc hiện tại từ URL.
    const filters = parseTransactionFilters({
        range:
            searchParams.get("range") ?? undefined,
        type:
            searchParams.get("type") ?? undefined,
        category:
            searchParams.get("category") ?? undefined,
        q:
            searchParams.get("q") ?? undefined,
    });

    // ========================================
    // 1. CHUYỂN TRANG VỚI BỘ LỌC MỚI
    // ========================================

    function navigateWithFilters(
        params: URLSearchParams
    ) {
        // Dự phòng nếu sau này thêm phân trang.
        params.delete("page");

        const query = params.toString();

        router.replace(
            query ? `${pathname}?${query}` : pathname,
            { scroll: false }
        );
    }

    // ========================================
    // 2. CẬP NHẬT MỘT BỘ LỌC
    // ========================================

    function updateFilter(
        key: FilterKey,
        value: string
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        const shouldRemove =
            (key === "range" &&
                value === "this-month") ||
            (key === "q" &&
                value.trim() === "") ||
            (key !== "range" &&
                key !== "q" &&
                value === "all");

        if (shouldRemove) {
            params.delete(key);
        } else {
            params.set(
                key,
                key === "q" ? value.trim() : value
            );
        }

        navigateWithFilters(params);
    }

    // ========================================
    // 3. TÌM KIẾM THEO MÔ TẢ
    // ========================================

    function handleSearch(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const formData = new FormData(
            event.currentTarget
        );

        const query = String(
            formData.get("q") ?? ""
        ).trim();

        updateFilter("q", query);
    }

    // ========================================
    // 4. ĐẶT LẠI BỘ LỌC
    // ========================================

    function resetFilters() {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        params.delete("range");
        params.delete("type");
        params.delete("category");
        params.delete("q");

        navigateWithFilters(params);
    }

    // ========================================
    // 5. TRẠNG THÁI ĐANG LỌC
    // ========================================


    // ========================================
    // V1.0 - CSV EXPORT URL
    // ========================================

    // Giữ nguyên bộ lọc đang chọn trong URL.
    const exportParams = new URLSearchParams(
        searchParams.toString()
    );

    // Không cần mang theo tham số phân trang.
    exportParams.delete("page");

    const exportQuery = exportParams.toString();

    const exportHref = exportQuery
        ? `/transactions/export?${exportQuery}`
        : "/transactions/export";


    const activeCount =
        (filters.range !== "this-month" ? 1 : 0) +
        (filters.type ? 1 : 0) +
        (filters.category ? 1 : 0) +
        (filters.q ? 1 : 0);

    const selectClass =
        "w-full rounded-xl border border-line " +
        "bg-card px-4 py-3 text-sm text-foreground " +
        "outline-none transition-colors " +
        "focus:border-brand focus:ring-2 " +
        "focus:ring-brand/20";

    const labelClass =
        "mb-2 block text-sm font-medium " +
        "text-foreground";

    // ========================================
    // 6. GIAO DIỆN
    // ========================================

    return (
        <section
            aria-labelledby="transaction-filter-heading"
            className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
        >
            {/* HEADER */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2
                        id="transaction-filter-heading"
                        className="text-lg font-bold text-foreground"
                    >
                        Tìm kiếm và bộ lọc
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Tìm giao dịch theo mô tả,
                        thời gian và danh mục.
                    </p>
                </div>

                {activeCount > 0 && (
                    <span className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                        {activeCount} bộ lọc tùy chỉnh
                    </span>
                )}
            </div>

            {/* TÌM KIẾM */}
            <form
                onSubmit={handleSearch}
                role="search"
                className="mb-5"
            >
                <label
                    htmlFor="transaction-search"
                    className={labelClass}
                >
                    Tìm theo mô tả giao dịch
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="h-5 w-5"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                        </span>

                        <input
                            key={searchParams.get("q") ?? ""}
                            id="transaction-search"
                            name="q"
                            type="search"
                            maxLength={120}
                            defaultValue={filters.q ?? ""}
                            placeholder="Ví dụ: cà phê, lương, mua sắm..."
                            autoComplete="off"
                            className={`${selectClass} pl-12`}
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-background"
                    >
                        Tìm kiếm
                    </button>
                </div>
            </form>

            {/* BỘ LỌC */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* THỜI GIAN */}
                <div>
                    <label
                        htmlFor="filter-range"
                        className={labelClass}
                    >
                        Thời gian
                    </label>

                    <select
                        id="filter-range"
                        value={filters.range}
                        onChange={(event) =>
                            updateFilter(
                                "range",
                                event.target.value
                            )
                        }
                        className={selectClass}
                    >
                        <option value="this-month">
                            Tháng này
                        </option>

                        <option value="last-month">
                            Tháng trước
                        </option>

                        <option value="all">
                            Tất cả thời gian
                        </option>
                    </select>
                </div>

                {/* LOẠI GIAO DỊCH */}
                <div>
                    <label
                        htmlFor="filter-type"
                        className={labelClass}
                    >
                        Loại giao dịch
                    </label>

                    <select
                        id="filter-type"
                        value={filters.type ?? "all"}
                        onChange={(event) =>
                            updateFilter(
                                "type",
                                event.target.value
                            )
                        }
                        className={selectClass}
                    >
                        <option value="all">
                            Tất cả loại
                        </option>

                        <option value="INCOME">
                            Thu nhập
                        </option>

                        <option value="EXPENSE">
                            Chi tiêu
                        </option>
                    </select>
                </div>

                {/* DANH MỤC */}
                <div>
                    <label
                        htmlFor="filter-category"
                        className={labelClass}
                    >
                        Danh mục
                    </label>

                    <select
                        id="filter-category"
                        value={filters.category ?? "all"}
                        onChange={(event) =>
                            updateFilter(
                                "category",
                                event.target.value
                            )
                        }
                        className={selectClass}
                    >
                        <option value="all">
                            Tất cả danh mục
                        </option>

                        {Object.entries(
                            CATEGORY_LABELS
                        ).map(([value, label]) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-xs text-muted-foreground">
                    Các bộ lọc có thể kết hợp với nhau.
                    Mặc định hiển thị giao dịch tháng này.
                </p>


                {/* V1.0 - EXPORT CSV */}
                <div className="flex flex-wrap gap-2">
                    <a
                        href={exportHref}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/15 focus-visible:outline-2 focus-visible:outline-brand"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <path d="M12 3v12" />
                            <path d="m7 10 5 5 5-5" />
                            <path d="M5 17v3h14v-3" />
                        </svg>

                        Xuất CSV
                    </a>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground sm:hidden">
                Mẹo: Vuốt ngang bảng giao dịch phía dưới
                để xem đầy đủ các cột trên điện thoại.
            </p>
        </section>
    );
}
