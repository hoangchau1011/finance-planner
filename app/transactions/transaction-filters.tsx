
"use client";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

import { CATEGORY_LABELS } from "@/lib/finance";
import { parseTransactionFilters } from "@/lib/validation";

type FilterKey = "range" | "type" | "category";

export function TransactionFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = parseTransactionFilters({
        range: searchParams.get("range") ?? undefined,
        type: searchParams.get("type") ?? undefined,
        category: searchParams.get("category") ?? undefined,
    });

    // Cập nhật URL khi người dùng thay đổi bộ lọc
    function updateFilter(key: FilterKey, value: string) {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        if (
            (key === "range" && value === "this-month") ||
            (key !== "range" && value === "all")
        ) {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        // Quay về trang đầu nếu sau này có phân trang
        params.delete("page");

        const query = params.toString();

        router.replace(
            query ? `${pathname}?${query}` : pathname,
            { scroll: false },
        );
    }

    // Xóa bộ lọc, trở về mặc định: Tháng này
    function resetFilters() {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        params.delete("range");
        params.delete("type");
        params.delete("category");
        params.delete("page");

        const query = params.toString();

        router.replace(
            query ? `${pathname}?${query}` : pathname,
            { scroll: false },
        );
    }

    const selectClass =
        "w-full rounded-xl border border-line " +
        "bg-background px-3 py-2.5 text-sm " +
        "text-foreground focus-visible:outline-2 " +
        "focus-visible:outline-brand";

    return (
        <section
            aria-label="Bộ lọc giao dịch"
            className="rounded-2xl border border-line bg-surface p-4"
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* LỌC THEO THỜI GIAN */}
                <div>
                    <label
                        htmlFor="filter-range"
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Thời gian
                    </label>

                    <select
                        id="filter-range"
                        value={filters.range}
                        onChange={(event) =>
                            updateFilter("range", event.target.value)
                        }
                        className={selectClass}
                    >
                        <option value="this-month">Tháng này</option>
                        <option value="last-month">Tháng trước</option>
                        <option value="all">Tất cả</option>
                    </select>
                </div>

                {/* LỌC THEO LOẠI GIAO DỊCH */}
                <div>
                    <label
                        htmlFor="filter-type"
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Loại giao dịch
                    </label>

                    <select
                        id="filter-type"
                        value={filters.type ?? "all"}
                        onChange={(event) =>
                            updateFilter("type", event.target.value)
                        }
                        className={selectClass}
                    >
                        <option value="all">Tất cả</option>
                        <option value="INCOME">Thu nhập</option>
                        <option value="EXPENSE">Chi tiêu</option>
                    </select>
                </div>

                {/* LỌC THEO DANH MỤC */}
                <div>
                    <label
                        htmlFor="filter-category"
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Danh mục
                    </label>

                    <select
                        id="filter-category"
                        value={filters.category ?? "all"}
                        onChange={(event) =>
                            updateFilter("category", event.target.value)
                        }
                        className={selectClass}
                    >
                        <option value="all">Tất cả danh mục</option>

                        {Object.entries(CATEGORY_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                {/* NÚT XÓA BỘ LỌC */}
                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={resetFilters}
                        className={
                            "w-full rounded-xl border border-line " +
                            "px-4 py-2.5 text-sm font-medium " +
                            "transition-colors hover:bg-surface-muted"
                        }
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>
            </div>
        </section>
    );
}
