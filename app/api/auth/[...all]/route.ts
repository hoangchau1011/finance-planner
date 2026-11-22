
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Kết nối Better Auth với Next.js App Router.
// GET: xử lý session, OAuth callback...
// POST: xử lý đăng ký, đăng nhập, đăng xuất...
export const { GET, POST } = toNextJsHandler(auth);
