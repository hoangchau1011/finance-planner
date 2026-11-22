
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { signOut, useSession } from "@/lib/auth-client";

export function AuthNav() {
    const router = useRouter();

    // Lấy trạng thái đăng nhập từ Better Auth.
    const { data: session, isPending } = useSession();

    const [isSigningOut, setIsSigningOut] = useState(false);

    async function handleSignOut() {
        if (isSigningOut) return;

        setIsSigningOut(true);

        try {
            const result = await signOut();

            if (result.error) {
                toast.error(
                    result.error.message ?? "Không thể đăng xuất."
                );
                return;
            }

            toast.success("Đăng xuất thành công!");

            // Trở về trang đăng nhập.
            router.replace("/login");
            router.refresh();
        } catch {
            toast.error(
                "Có lỗi kết nối. Vui lòng thử lại."
            );
        } finally {
            setIsSigningOut(false);
        }
    }

    // Chờ Better Auth xác định session.
    // Giữ nội dung ban đầu ổn định khi hydration.
    if (isPending) {
        return (
            <span
                role="status"
                className="px-2 text-xs text-muted-foreground"
            >
                Đang kiểm tra...
            </span>
        );
    }

    // Người dùng chưa đăng nhập.
    if (!session?.user) {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/login"
                    className="rounded-xl px-3 py-2 font-medium text-foreground hover:bg-muted hover:text-brand"
                >
                    Đăng nhập
                </Link>

                <Link
                    href="/register"
                    className="rounded-xl border border-transparent bg-brand px-3 py-2 font-semibold text-white hover:bg-brand/85 dark:text-background"
                >
                    Đăng ký
                </Link>
            </div>
        );
    }

    // Người dùng đã đăng nhập.
    return (
        <div className="flex items-center gap-2">
            <span
                title={session.user.name}
                className="hidden max-w-32 truncate text-sm font-medium text-foreground sm:inline"
            >
                {session.user.name}
            </span>

            <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSigningOut ? "Đang thoát..." : "Đăng xuất"}
            </button>
        </div>
    );
}
