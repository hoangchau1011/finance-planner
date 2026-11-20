# AGENTS.md — Finance Planner

## Luật dự án (PHY10615 – Phát triển ứng dụng web)

### Phiên bản & công nghệ (không tự ý đổi)
- Next.js 16.4 App Router, React 19, TypeScript. KHÔNG dùng pages router, getServerSideProps, next/router; dùng proxy.ts (không có middleware.ts).
- Tailwind CSS v4 cấu hình bằng CSS (@theme). KHÔNG tạo tailwind.config.js.
- shadcn/ui dùng Radix: npx shadcn@latest add <component>.
- Prisma ORM 7 (KHÔNG nâng lên 8): generator "prisma-client" có output, adapter @prisma/adapter-pg, URL trong prisma.config.ts.
- Better Auth 1.7 (KHÔNG dùng NextAuth/Auth.js). Session: auth.api.getSession({ headers: await headers() }).
- Zod 4: z.flattenError(), { error: "..." }, z.email().
- Test: Vitest 5 + React Testing Library; E2E: Playwright.

### Bảo mật (bắt buộc)
- Mọi Server Action và Route Handler nghiệp vụ: gọi requireUser() trước, validate input bằng Zod, mọi truy vấn lọc theo userId lấy từ session.
- Mọi page chứa dữ liệu riêng tư: gọi requireUser() ở đầu page.
- Sửa/xoá dùng updateMany/deleteMany với where: { id, userId } và kiểm tra count.
- Không đưa bí mật vào biến NEXT_PUBLIC_*; không commit .env.
- Không dùng dangerouslySetInnerHTML hoặc $queryRawUnsafe.

### Quy trình
- Trước khi kết thúc: chạy npm run lint, npm run typecheck, npx vitest run.
- Thay đổi logic nghiệp vụ phải kèm test.
- Không tự cài gói npm mới: nêu tên gói, lý do, link npm và chờ người dùng xác nhận.
- Tóm tắt thay đổi ngắn gọn để sinh viên ghi vào AI_LOG.md.

### Phạm vi đặc biệt của fp1
- fp1 chỉ gồm schema, migration, seed và dashboard **chỉ đọc trên local**.
- Chưa có xác thực: `/dashboard` từ chối ở production và khi không bật FP1_LOCAL_PREVIEW.
- Preview local dùng bản ghi demo và mọi truy vấn đều lọc theo demo userId; không dùng thiết kế này để xử lý dữ liệu người dùng thật.
- fp2: CRUD + URL filter. fp3: Better Auth 1.7, `requireUser()`, phân quyền toàn diện.
- Ngoại lệ bắt buộc sau fp3: Route Handler đăng nhập Better Auth phải công khai để người chưa xác thực có thể đăng ký/đăng nhập.
