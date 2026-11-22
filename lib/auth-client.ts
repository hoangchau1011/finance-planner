
import { createAuthClient } from "better-auth/react";

// Better Auth tự sử dụng cùng domain với ứng dụng Next.js.
// API mặc định: /api/auth
export const authClient = createAuthClient();

// Các hàm dành cho giao diện React
export const {
    signIn,
    signUp,
    signOut,
    useSession,
} = authClient;
