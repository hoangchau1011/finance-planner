
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const form = new FormData(event.currentTarget);

        const name = String(form.get("name") ?? "").trim();
        const email = String(form.get("email") ?? "")
            .trim()
            .toLowerCase();
        const password = String(form.get("password") ?? "");
        const confirmPassword = String(
            form.get("confirmPassword") ?? ""
        );

        if (!name || !email || !password) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (password.length < 8 || password.length > 128) {
            setError("Mật khẩu phải có từ 8 đến 128 ký tự.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            const result = await signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                setError(
                    result.error.message ??
                    "Không thể đăng ký. Vui lòng thử lại."
                );
                return;
            }

            setSuccess(true);
        } catch {
            setError(
                "Không thể kết nối đến máy chủ. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-md px-4 py-12">
            <div className="theme-surface rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Tạo tài khoản
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Bắt đầu quản lý tài chính cùng Finance Planner
                    </p>
                </div>

                {success ? (
                    <div
                        role="status"
                        className="space-y-4 text-center"
                    >
                        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Đăng ký tài khoản thành công!
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Tài khoản đã được tạo thành công!
                            Hãy đăng nhập để bắt đầu quản lý tài chính
                            với Finance Planner.
                        </p>

                        <Link
                            href="/login"
                            className="inline-block rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                Họ và tên
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Nhập họ và tên"
                                required
                                maxLength={100}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

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
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                Mật khẩu
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Tối thiểu 8 ký tự"
                                required
                                minLength={8}
                                maxLength={128}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                Xác nhận mật khẩu
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Nhập lại mật khẩu"
                                required
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

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
                            disabled={loading}
                            className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Đang tạo tài khoản..."
                                : "Đăng ký"}
                        </button>


                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Đã có tài khoản?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-brand hover:underline"
                            >
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </main>
    );
}
