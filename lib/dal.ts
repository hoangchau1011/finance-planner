import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
    constructor() {
        super("Bạn chưa được phép truy cập dữ liệu tài chính.");
        this.name = "UnauthorizedError";
    }
}


export async function requireUser(): Promise<{
    id: string;
    name: string;
}> {
    const h = await headers();
    const host = h.get("host") ?? "";

    if (
        process.env.NODE_ENV !== "development" ||
        process.env.FP1_LOCAL_PREVIEW !== "true" ||
        !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    ) {
        throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
        where: {
            email: "demo@phy10615.vn",
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!user) {
        throw new UnauthorizedError();
    }

    return user;
}