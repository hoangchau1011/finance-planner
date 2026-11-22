
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";

// Icon GitHub dạng SVG, tự đổi màu theo theme.
function GitHubIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.8a5.3 5.3 0 0 0-1.4-3.6 4.9 4.9 0 0 0-.1-3.6S17.6 1 15 3a13 13 0 0 0-7 0C5.4 1 4.2 1.4 4.2 1.4a4.9 4.9 0 0 0-.1 3.6A5.3 5.3 0 0 0 2.7 8.6c0 5.3 3.2 6.5 6.2 6.8a3.4 3.4 0 0 0-.9 2.7V22" />
        </svg>
    );
}

export default function LoginPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isBusy = loading || githubLoading;

    // ==========================================
    // ĐĂNG NHẬP BẰNG EMAIL / MẬT KHẨU
    // ==========================================

    async function handleLogin(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        if (isBusy) return;

        setError("");

        const form = new FormData(event.currentTarget);

        const email = String(form.get("email") ?? "")
            .trim()
            .toLowerCase();

        const password = String(
            form.get("password") ?? ""
        );

        if (!email || !password) {
            setError("Vui lòng nhập email và mật khẩu.");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
                rememberMe: true,
            });

            if (result.error) {
                if (
                    result.error.code ===
                    "INVALID_EMAIL_OR_PASSWORD"
                ) {
                    setError(
                        "Email hoặc mật khẩu không chính xác."
                    );
                } else {
                    setError(
                        "Đăng nhập thất bại. Vui lòng thử lại."
                    );
                }

                return;
            }

            toast.success("Đăng nhập thành công!");

            router.replace("/dashboard");
            router.refresh();
        } catch {
            setError(
                "Không thể kết nối đến máy chủ."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // ĐĂNG NHẬP BẰNG GITHUB OAUTH
    // ==========================================

    async function handleGitHubLogin() {
        if (isBusy) return;

        setError("");
        setGithubLoading(true);

        try {
            const result = await signIn.social({
                provider: "github",

                // Sau khi GitHub xác thực thành công.
                callbackURL: "/dashboard",

                // Khi OAuth thất bại.
                errorCallbackURL: "/login",
            });

            if (result.error) {
                setError(
                    `Không thể đăng nhập bằng GitHub. Mã lỗi: ${result.error.code ?? "UNKNOWN"
                    }`
                );
            }

            // Better Auth tự chuyển trình duyệt sang GitHub.
        } catch {
            setError(
                "Không thể kết nối với GitHub. Vui lòng thử lại."
            );
        } finally {
            setGithubLoading(false);
        }
    }

    // ==========================================
    // GIAO DIỆN ĐĂNG NHẬP
    // ==========================================

    return (
        <main className="mx-auto w-full max-w-md px-4 py-12">
            <div className="theme-surface rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-8">

                {/* HEADER */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Chào mừng trở lại!
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Đăng nhập để quản lý tài chính cá nhân
                    </p>
                </div>

                {/* EMAIL LOGIN */}
                <form
                    onSubmit={handleLogin}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="example@gmail.com"
                            required
                            disabled={isBusy}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Mật khẩu
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="current-password"
                                placeholder="Nhập mật khẩu"
                                required
                                disabled={isBusy}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-16 text-slate-900 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                disabled={isBusy}
                                aria-label={
                                    showPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                            >
                                {showPassword ? "Ẩn" : "Hiện"}
                            </button>
                        </div>
                    </div>

                    {/* THÔNG BÁO LỖI */}
                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition-colors duration-300 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Đang đăng nhập..."
                            : "Đăng nhập"}
                    </button>
                </form>

                {/* ĐƯỜNG PHÂN CÁCH */}
                <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />

                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        hoặc
                    </span>

                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* GITHUB OAUTH */}
                <button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition-colors duration-300 ease-in-out hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                    <GitHubIcon />

                    <span>
                        {githubLoading
                            ? "Đang kết nối GitHub..."
                            : "Tiếp tục với GitHub"}
                    </span>
                </button>

                {/* ĐĂNG KÝ */}
                <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
                    Chưa có tài khoản?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                    >
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </main>
    );
}
