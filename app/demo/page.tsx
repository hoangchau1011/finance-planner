
import type { Metadata } from "next";

import {
    createGuestDemoState,
    getGuestMonthKey,
} from "@/lib/guest-demo-data";

import { GuestDemo } from "./guest-demo";

// ==========================================
// FINANCE PLANNER V1.0 - GUEST DEMO PAGE
// ==========================================

export const metadata: Metadata = {
    title: "Dùng thử | Finance Planner",
    description:
        "Trải nghiệm Finance Planner không cần đăng nhập với dữ liệu mô phỏng.",
};

// Tạo dữ liệu theo thời điểm truy cập.
export const dynamic = "force-dynamic";

export default function DemoPage() {
    const now = new Date();

    return (
        <GuestDemo
            initialData={createGuestDemoState(now)}
            initialMonth={getGuestMonthKey(now)}
        />
    );
}
