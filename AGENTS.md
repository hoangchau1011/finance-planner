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

**Đã triển khai:**
- Tích hợp Better Auth 1.7 với Prisma ORM 7 và PostgreSQL Neon.
- Bổ sung các bảng Session, Account, Verification; giữ nguyên bảng User và dữ liệu tài chính cũ.
- Đăng ký và đăng nhập bằng email/mật khẩu.
- Tạo API xác thực `/api/auth/[...all]`.
- Thay cơ chế tài khoản demo bằng session Better Auth trong `lib/dal.ts`.
- Bảo vệ Dashboard và Transactions bằng `requireUser()`.
- Chuyển người chưa đăng nhập đến `/login`.
- Kiểm tra quyền trong Server Actions thêm, sửa, xóa giao dịch.
- API `/api/transactions` từ chối người chưa đăng nhập bằng HTTP 401.
- Mọi truy vấn giao dịch sử dụng `userId` lấy từ session.
- Header hỗ trợ đăng nhập, đăng xuất và chuyển giao diện Sáng/Tối.
- Trang 404 được cập nhật phù hợp với fp3.
- Bổ sung 12 unit test về phân quyền bằng mock, không thay đổi dữ liệu Neon.

**Kết quả kiểm thử ngày 22/11/2026:**
- `npm run typecheck`: đạt.
- `npm run lint`: đạt.
- `npx vitest run`: 49/49 test đạt trên 8 file.
- `npm run build`: thành công với Next.js 16.4.6.
- Đã kiểm tra thủ công việc tách dữ liệu Dashboard theo tài khoản.
- Đã kiểm tra API từ chối truy cập khi chưa đăng nhập.
- Đã kiểm tra giao diện 404 mới.

**Còn cần hoàn thiện:**
- Cấu hình GitHub OAuth và kiểm thử đăng nhập bằng GitHub.
- Rà soát file tạm, biến môi trường và thông tin bí mật trước commit.



## Finance Planner v1.0 — Wishlist CRUD

### Features

- Manage personal financial goals (Wishlist).
- Create, update, and delete wishlist items.
- Validate input with Zod 4.
- Display wishlist items with priority levels.
- Show wishlist statistics and recent goals.
- Integrate Wishlist navigation into the Header.
- Support responsive layouts and light/dark themes.
- Display success and error messages using Sonner.

### Wishlist data model

Uses the existing Prisma model `WishlistItem`.

Main fields:
- `id`: Unique wishlist item identifier.
- `userId`: Owner of the wishlist item.
- `name`: Financial goal name.
- `cost`: Target amount in VND.
- `priority`: LOW, MEDIUM, or HIGH.

Do not modify the Prisma schema unless a new feature
explicitly requires a database change.

### Wishlist architecture

- `lib/wishlist-validation.ts`
  Zod validation and form types.

- `app/wishlist/actions.ts`
  Authenticated CRUD Server Actions.

- `app/wishlist/wishlist-form.tsx`
  Create and edit form using React useActionState.

- `app/wishlist/wishlist-table.tsx`
  Wishlist list, inline editing, and delete confirmation.

- `app/wishlist/page.tsx`
  Protected page with user-specific data.

- `__tests__/wishlist.test.ts`
  Validation, CRUD, and authorization unit tests.

### Authentication and authorization

- Use Better Auth for authentication.
- Obtain the current user through `requireUser()`.
- Never trust a `userId` submitted by the browser.
- Filter user-owned database operations by `userId`.
- Use `updateMany()` and `deleteMany()` with both
  the item ID and authenticated user ID.
- Do not expose data belonging to another user.

### Dashboard integration

- Dashboard displays up to 4 recent wishlist items.
- The full list is available at `/wishlist`.
- Dashboard and Wishlist must refresh after mutations.
- Existing progress indicators compare the current
  account balance with the target cost.
- Do not describe this as money actually saved for
  an individual goal.

### Validation rules

- Goal name: required, maximum 100 characters.
- Target amount: positive integer in VND.
- Maximum target amount: 2,147,483,647 VND.
- Priority: LOW, MEDIUM, HIGH.
- Validate all mutations on the server.

### Quality checks

Run before committing changes:

1. `npm run typecheck`
2. `npm run lint`
3. `npx vitest run`
4. `npm run build`

Wishlist unit tests use mocks and must not modify
production data in Neon PostgreSQL.

### Git and AI documentation

- Keep `AI_LOG.md` updated for each release.
- Record AI assistance, manual work, errors, and fixes.
- Present AI_LOG changes to the user for review.
- Obtain explicit user approval before committing
  or pushing to GitHub.
- Never commit `.env`, passwords, OAuth secrets,
  or temporary credential-management scripts.

### Kế hoạch phát triển tiếp theo

Các nội dung chưa hoàn thành trong giai đoạn Wishlist CRUD:

- Bổ sung thông báo khi đạt mốc tiết kiệm.
- Xây dựng biểu đồ tài chính bằng shadcn Chart.
- Triển khai ba tính năng mở rộng theo kế hoạch môn học.
- Bổ sung component tests và kiểm thử tích hợp.
- Thiết lập GitHub Actions CI.
- Rà soát và hoàn thiện README.md.

Chỉ đánh dấu các chức năng trên là hoàn thành
sau khi đã triển khai và kiểm thử thực tế.

### Quy tắc Git và AI_LOG

- Sau mỗi đợt phát triển, chạy lint, typecheck, Vitest và build.
- Ghi chép trung thực quá trình sử dụng AI trong AI_LOG.md.
- Trước khi commit hoặc push lên GitHub, phải cho người dùng xem nội dung AI_LOG.md dự kiến.
- Chỉ thực hiện commit, tạo Git tag hoặc push sau khi người dùng xác nhận.
- Không tự điền thay người dùng phần kiểm chứng cá nhân và Commit/PR.
- Không tự ý thay đổi lịch sử commit hoặc ngày tạo Git tag.
- Không bao giờ commit file .env hay thông tin bí mật.
