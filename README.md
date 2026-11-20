# Finance Planner — PHY10615 (fp1)

Finance Planner là ứng dụng full-stack theo dõi thu, chi và mục tiêu tiết kiệm cá nhân. Mốc **fp1** tập trung vào Prisma 7 + PostgreSQL Neon, tạo dữ liệu mẫu và dashboard **chỉ đọc khi chạy development trên máy local**. Better Auth và phân quyền người dùng thật sẽ được bổ sung ở fp3; chưa dùng fp1 để chứa dữ liệu tài chính thật.

## Phạm vi đã tạo ở fp1

- Next.js 16.4 App Router, React 19, TypeScript và Tailwind CSS v4 (CSS `@theme`).
- Prisma 7 dùng `prisma-client` với `output`, `@prisma/adapter-pg`, URL CLI trong `prisma.config.ts`.
- Model `User`, `Transaction`, `WishlistItem`; 8 giá trị `Category` theo đề.
- Migration khởi tạo `prisma/migrations/20261120_fp1_init/migration.sql` (cần áp dụng và kiểm chứng bằng Neon của sinh viên).
- Seed **42 giao dịch** trải trên bốn tháng cùng 3 wishlist, với user demo `demo@phy10615.vn`.
- Dashboard: số dư, tổng thu/chi, bảng chi tiêu danh mục trong tháng, giao dịch gần đây, tiến độ wishlist.
- 13 unit test thuần trong Vitest (bộ mẫu tuần 9 + kiểm tra múi giờ Việt Nam).

## Công nghệ

- Node.js **24** (khuyến nghị dùng `nvm use` theo `.nvmrc`).
- Next.js **16.4.6**, React **19**, TypeScript **5**, Tailwind **4**.
- Prisma ORM/Client/**adapter-pg 7.10.1**, PostgreSQL trên Neon.
- Vitest **5**.
- Better Auth **1.7**, shadcn/ui Radix, Zod **4**, Sonner và Recharts: các giai đoạn sau, chưa cài ở fp1.

## Bắt đầu trên máy local

1. Mở terminal trong thư mục `finance-planner-fp1`, dùng **Node.js 24** (`node -v`).
2. Cài những package **đã được người dùng phê duyệt** bằng `npm install`. Lần đầu sẽ tạo `package-lock.json`, phải commit lockfile. Sau lần đầu có lockfile, dùng `npm ci`.
3. Sao chép `.env.example` sang `.env` và thay hai connection string Neon thật. **Không commit `.env`**.
4. Dùng database phát triển **mới, chưa có schema**. Chạy:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   npm run dev
   ```

5. Vào `http://localhost:3000/dashboard`. `FP1_LOCAL_PREVIEW=true` chỉ cho phép xem demo trong chế độ development và trên localhost.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npx vitest run
npm run build
```

Chỉ đánh dấu kiểm tra thành công sau khi đã chạy trên máy có Node 24, package đã cài và cơ sở dữ liệu Neon thật. Các file trong bộ fp1 được chuẩn bị nhưng **chưa thể xác nhận các lệnh trên đã thành công** trong môi trường tạo hiện tại (không có npm registry/Neon).

## Bảo mật và giới hạn

- `/dashboard` được chặn ở production để không lộ dữ liệu tài khoản demo trước khi có Better Auth. Khi chỉ chạy bằng `npm run dev` từ script đã cung cấp, máy chủ bind vào 127.0.0.1.
- Demo user **chưa có mật khẩu**. Không ghi mật khẩu demo hoặc production URL giả ở fp1.
- Seed dùng ID ổn định và `skipDuplicates` nên chạy lại sẽ không tạo bản ghi trùng; dữ liệu ngày được sinh theo tháng tương đối vào lần seed đầu.
- `getDateRange()` của tuần 9 vẫn giữ để phục vụ test gốc, còn dashboard fp1 dùng `getVietnamMonthRange()` thống nhất theo `Asia/Ho_Chi_Minh`.
- `prisma/migrations/20261120_fp1_init/migration.sql` là SQL đã soạn theo schema để có điểm khởi đầu; sinh viên cần đối chiếu bằng Prisma trên database phát triển mới trước khi xem như migration đã kiểm chứng.

## Checklist theo tiến độ

- [x] Code chuẩn bị cho fp1: schema/migration/seed/dashboard đọc dữ liệu.
- [ ] `npx prisma migrate dev` và seed chạy thành công trên Neon thật.
- [ ] Lint, typecheck, unit test và build được xác minh trên máy local.
- [ ] `fp1` commit và git tag thật đã được tạo.
- [ ] fp2: CRUD giao dịch, lọc URL và Zod.
- [ ] fp3: Better Auth email/password + GitHub, `requireUser()`, kiểm tra `userId`.
- [ ] v1.0: wishlist CRUD, biểu đồ, Sonner, mở rộng, CI, Vercel.

## Sản phẩm cuối kỳ (sẽ cập nhật)

- GitHub repository: `[Tự điền: URL repo]`
- Production Vercel: `[Tự điền: URL production]`
- Tài khoản demo email/mật khẩu: `[Tự điền sau fp3, không viết mật khẩu thật lên repo]`
- Screenshots: `[Tự bổ sung sau khi chụp các màn hình chạy thật]`

Xem nhật ký sử dụng AI ở [AI_LOG.md](./AI_LOG.md). Các quyết định kiến trúc và luật bảo mật ở [AGENTS.md](./AGENTS.md).
