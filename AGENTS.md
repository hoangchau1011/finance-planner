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


### Tiến độ phát triển Finance Planner

#### fp1 — Nền tảng
- Prisma ORM 7 + PostgreSQL Neon.
- Schema, migration và seed dữ liệu mẫu.
- Dashboard chỉ đọc trên môi trường local.
- Git tag: `fp1`.

#### fp2 — Quản lý giao dịch
- CRUD giao dịch bằng Next.js Server Actions.
- Validation phía server bằng Zod 4.
- Hiển thị lỗi từng trường và toast Sonner.
- Lọc theo tháng, loại và danh mục qua URL searchParams.
- Lọc dữ liệu phía server bằng Prisma.
- Mọi truy vấn nghiệp vụ phải giới hạn theo userId.
- Sửa/xóa phải dùng updateMany/deleteMany và kiểm tra count.
- Có unit test cho validation và bộ lọc.
- Chỉ cho phép sử dụng bản demo trên localhost.
- Không triển khai CRUD công khai khi chưa có Better Auth.

#### fp3 — Xác thực và phân quyền
- Tích hợp Better Auth 1.7 (Email/Password + GitHub).
- Tạo User, Session, Account, Verification.
- Thay thế cơ chế demo bằng session thực tế.
- Bảo vệ toàn bộ trang, Server Actions và API nghiệp vụ bằng requireUser().
- Route Handler xác thực của Better Auth phải cho phép người chưa đăng nhập truy cập để đăng ký/đăng nhập.

#### v1.0 — Hoàn thiện
- Wishlist CRUD và thông báo mốc tiết kiệm.
- Dashboard có biểu đồ shadcn Chart.
- Ba tính năng mở rộng theo kế hoạch.
- Unit test, component test và GitHub Actions CI.
- Hoàn thiện README.md, AI_LOG.md và tài khoản demo.

### Quy tắc Git và AI_LOG

- Sau mỗi đợt phát triển, chạy lint, typecheck, Vitest và build.
- Ghi chép trung thực quá trình sử dụng AI trong AI_LOG.md.
- Trước khi commit hoặc push lên GitHub, phải cho người dùng xem nội dung AI_LOG.md dự kiến.
- Chỉ thực hiện commit, tạo Git tag hoặc push sau khi người dùng xác nhận.
- Không tự điền thay người dùng phần kiểm chứng cá nhân và Commit/PR.
- Không tự ý thay đổi lịch sử commit hoặc ngày tạo Git tag.
- Không bao giờ commit file .env hay thông tin bí mật.
