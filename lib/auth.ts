
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

// Thông tin GitHub OAuth lấy từ biến môi trường
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const auth = betterAuth({

    // Địa chỉ chính của Better Auth
    baseURL: process.env.BETTER_AUTH_URL,

    // Chỉ cho phép hai địa chỉ local khi phát triển.
    trustedOrigins:
        process.env.NODE_ENV === "development"
            ? [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
            : [],

    // Sử dụng PostgreSQL Neon thông qua Prisma 7
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // Cho phép đăng ký và đăng nhập bằng email/mật khẩu
    emailAndPassword: {
        enabled: true,
    },

    // Kích hoạt GitHub OAuth khi đã cấu hình đủ credentials
    ...(githubClientId && githubClientSecret
        ? {
            socialProviders: {
                github: {
                    clientId: githubClientId,
                    clientSecret: githubClientSecret,
                },
            },
        }
        : {}),
});
