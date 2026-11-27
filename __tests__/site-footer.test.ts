
/**
 * @vitest-environment jsdom
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    cleanup,
    render,
    screen,
} from "@testing-library/react";

import {
    createElement,
    type ReactNode,
} from "react";

// ==========================================
// FINANCE PLANNER V1.0
// SITE FOOTER COMPONENT TEST
// ==========================================

const mocks = vi.hoisted(() => ({
    useSession: vi.fn(),
}));

// Giả lập Better Auth, không cần đăng nhập thật.
vi.mock("@/lib/auth-client", () => ({
    authClient: {
        useSession: mocks.useSession,
    },
}));

// Giả lập Next.js Link để kiểm thử href.
vi.mock("next/link", async () => {
    const { createElement: h } =
        await import("react");

    return {
        default: ({
            href,
            children,
        }: {
            href: string;
            children: ReactNode;
        }) => h("a", { href }, children),
    };
});

import {
    SiteFooter,
} from "@/components/site-footer";

// ==========================================
// THIẾT LẬP
// ==========================================

beforeEach(() => {
    vi.clearAllMocks();

    // Mặc định: khách chưa đăng nhập.
    mocks.useSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
    });
});

afterEach(() => {
    cleanup();
});

// ==========================================
// COMPONENT TESTS
// ==========================================

describe("SiteFooter - Finance Planner v1.0", () => {
    it("Hiển thị thông tin thương hiệu", () => {
        render(createElement(SiteFooter));

        expect(
            screen.getByText(
                "Finance Planner · PHY10615 · v1.0"
            )
        ).toBeTruthy();
    });

    it("Khách chưa đăng nhập nhìn thấy Khám phá", () => {
        render(createElement(SiteFooter));

        expect(
            screen.getByRole("navigation", {
                name: "Khám phá ứng dụng",
            })
        ).toBeTruthy();

        expect(
            screen.getByRole("link", {
                name: "Tạo tài khoản",
            })
        ).toBeTruthy();

        expect(
            screen.getByRole("link", {
                name: "Đăng nhập",
            })
        ).toBeTruthy();
    });

    it("Khách có thể mở Guest Demo", () => {
        render(createElement(SiteFooter));

        const demoLink = screen.getByRole(
            "link",
            {
                name: /Khám phá Guest Demo/i,
            }
        );

        expect(
            demoLink.getAttribute("href")
        ).toBe("/demo");
    });

    it("Đã đăng nhập thì ẩn mục Khám phá", () => {
        mocks.useSession.mockReturnValue({
            data: {
                user: {
                    id: "user-1",
                    name: "Test User",
                    email: "test@example.com",
                },
                session: {
                    id: "session-1",
                },
            },
            isPending: false,
            error: null,
        });

        render(createElement(SiteFooter));

        expect(
            screen.queryByRole("navigation", {
                name: "Khám phá ứng dụng",
            })
        ).toBeNull();

        // Các tính năng vẫn được hiển thị.
        expect(
            screen.getByRole("navigation", {
                name: "Liên kết tính năng",
            })
        ).toBeTruthy();
    });

    it("Đang kiểm tra session thì chưa hiện Khám phá", () => {
        mocks.useSession.mockReturnValue({
            data: null,
            isPending: true,
            error: null,
        });

        render(createElement(SiteFooter));

        expect(
            screen.queryByRole("navigation", {
                name: "Khám phá ứng dụng",
            })
        ).toBeNull();
    });

    it("Liên kết Mô phỏng trỏ đúng trang", () => {
        render(createElement(SiteFooter));

        const simulatorLink =
            screen.getByRole("link", {
                name: "Mô phỏng tài chính",
            });

        expect(
            simulatorLink.getAttribute("href")
        ).toBe("/simulator");
    });
});
