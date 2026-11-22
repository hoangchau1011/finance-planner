
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Lỗi khi người dùng chưa đăng nhập
// hoặc phiên đăng nhập không còn hợp lệ.
export class UnauthorizedError extends Error {
    constructor() {
        super("Bạn cần đăng nhập để truy cập dữ liệu tài chính.");
        this.name = "UnauthorizedError";
    }
}

// Thông tin người dùng mà Finance Planner cần sử dụng.
type CurrentUser = {
    id: string;
    name: string;
};

// Data Access Layer (DAL)
//
// Chỉ lấy user từ session Better Auth đã xác minh.
// Không sử dụng tài khoản demo hoặc userId do client gửi lên.
export async function requireUser(): Promise<CurrentUser> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Không có session hợp lệ => từ chối truy cập.
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    // userId lấy trực tiếp từ session đã xác thực.
    return {
        id: session.user.id,
        name: session.user.name,
    };
}
