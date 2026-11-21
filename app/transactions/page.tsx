
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { UnauthorizedError, requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatVietnamDateInput } from "@/lib/finance";
import { parseTransactionFilters } from "@/lib/validation";
import { transactionWhere } from "@/lib/transaction-queries";

import { TransactionForm } from "./transaction-form";
import { TransactionFilters } from "./transaction-filters";
import { TransactionTable } from "./transaction-table";

export const dynamic = "force-dynamic";

type PageProps = {
    searchParams: Promise<
        Record<string, string | string[] | undefined>
    >;
};

export default async function TransactionsPage({
    searchParams,
}: PageProps) {
    // Chỉ cho phép truy cập trong chế độ demo local fp2
    let user: Awaited<ReturnType<typeof requireUser>>;

    try {
        user = await requireUser();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            notFound();
        }

        throw error;
    }

    // Đọc và validate bộ lọc từ URL
    const params = await searchParams;
    const filters = parseTransactionFilters(params);

    // Lấy giao dịch của đúng người dùng từ Neon
    const transactions = await prisma.transaction.findMany({
        where: transactionWhere(user.id, filters),

        orderBy: [
            { date: "desc" },
            { id: "desc" },
        ],

        select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            category: true,
            date: true,
        },
    });

    // Chuyển Date thành chuỗi để truyền cho Client Component
    const rows = transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: formatVietnamDateInput(transaction.date),
    }));

    return (
        <main className="mx-auto max-w-6xl space-y-7 px-5 py-10 sm:px-8">
            {/* TIÊU ĐỀ */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-brand">
                        Finance Planner · fp2
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Quản lý giao dịch
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Xin chào {user.name}! Quản lý thu nhập
                        và chi tiêu của bạn tại đây.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                    Về Dashboard
                </Link>
            </div>

            {/* FORM THÊM GIAO DỊCH */}
            <section
                aria-labelledby="new-transaction"
                className="rounded-2xl border border-line bg-card p-6"
            >
                <h2
                    id="new-transaction"
                    className="mb-5 text-xl font-bold"
                >
                    Thêm giao dịch mới
                </h2>

                <TransactionForm />
            </section>

            {/* BỘ LỌC URL */}
            <Suspense
                fallback={
                    <p className="text-sm text-muted-foreground">
                        Đang tải bộ lọc...
                    </p>
                }
            >
                <TransactionFilters />
            </Suspense>

            {/* DANH SÁCH GIAO DỊCH */}
            <section
                aria-labelledby="transaction-list"
                className="space-y-4"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="transaction-list"
                        className="text-xl font-bold"
                    >
                        Danh sách giao dịch
                    </h2>

                    <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                        {rows.length} giao dịch
                    </span>
                </div>

                <TransactionTable rows={rows} />
            </section>
        </main>
    );
}
