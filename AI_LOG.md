# AI_LOG – Nhật ký sử dụng AI

> Mức AI của bài này: **Mức 4 – AI toàn phần có kiểm soát**.
> Khai báo trung thực: không ghi những kiểm tra hay commit chưa thực hiện.


## Phiên bản fp1 – Khởi tạo nền tảng

### 1. Nhật ký sử dụng AI

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 2026-11-20 | ChatGPT | Phân tích yêu cầu và lập kế hoạch | Đối chiếu mã mẫu Tuần 7, 8, 9 với yêu cầu PHY10615; lập lộ trình Finance Planner. | AI đề xuất công nghệ, cấu trúc thư mục và các mốc fp1–v1.0. | Tôi đối chiếu với yêu cầu học phần và lựa chọn thực hiện từng file để tiện theo dõi, kiểm tra. | Chưa có commit riêng cho bước lập kế hoạch. |
| 2026-11-20 | ChatGPT | Xây dựng nền tảng fp1 | Tạo ứng dụng Next.js 16.4, Prisma 7, kết nối Neon PostgreSQL, migration, seed và Dashboard. | Sử dụng bộ mã nền tảng có Prisma schema, dữ liệu mẫu 42 giao dịch, 3 mục wishlist và Dashboard chỉ đọc. | Tôi trực tiếp cấu hình Neon và `.env`, thực hiện các lệnh cài đặt, migration, generate và seed; chạy ứng dụng trên localhost. | `0057a75` – `feat(fp1): setup Prisma Neon seed and dashboard` |
| 2026-11-20 | ChatGPT | Kiểm thử và quản lý Git | Hướng dẫn lint, typecheck, Vitest, build và lưu mốc phiên bản. | Áp dụng quy trình kiểm tra chất lượng và quản lý mã nguồn bằng Git. | `npm run lint`: 0 lỗi, 1 warning ở `postcss.config.mjs`; `npm run typecheck`: đạt; Vitest: 13/13 test; `npm run build`: thành công. Tôi kiểm tra `.env` được bỏ qua, commit và tạo tag `fp1`. | Commit `0057a75`, tag `fp1` (đã có trên GitHub). |

### 2. Tự đánh giá cuối bài

**Phần mình trực tiếp thực hiện:** Tôi thiết lập môi trường VS Code, cấu hình cơ sở dữ liệu Neon và biến môi trường, chạy migration, seed, khởi động ứng dụng, kiểm tra Dashboard và thực hiện các lệnh kiểm thử. Tôi cũng trực tiếp quản lý Git, kiểm tra `.gitignore`, tạo commit và tag `fp1`.

**Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:** AI hỗ trợ xây dựng cấu trúc Next.js App Router, cách kết nối Prisma với PostgreSQL, tổ chức schema, migration, seed và Dashboard. Qua đó, tôi hiểu vai trò của từng thành phần và quy trình từ mã nguồn đến dữ liệu hiển thị.

**Hạn chế của AI và bài học:** Trong lần kiểm tra fp1, ESLint còn một warning tại `postcss.config.mjs`, được xử lý ở giai đoạn fp2. Trường hợp này cho thấy tôi cần tự chạy lint, typecheck, test và build thay vì mặc định mã AI cung cấp đã hoàn chỉnh.

---

## Phiên bản fp2 – Quản lý giao dịch

### 1. Nhật ký sử dụng AI

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 2026-11-21 | ChatGPT | Tạo validation và truy vấn giao dịch | Hướng dẫn tích hợp Zod 4, Sonner, Data Access Layer và lọc giao dịch theo người dùng. | Tạo `lib/dal.ts`, `lib/validation.ts`, `lib/transaction-queries.ts` và bổ sung thư viện. | Tôi tạo các file, kiểm tra TypeScript và đối chiếu Prisma schema. Ở fp2, DAL chỉ dùng tài khoản demo trong môi trường local được cho phép. | `ffac4ca` – fp2 |
| 2026-11-21 | ChatGPT | Xây dựng CRUD và API | Viết Server Actions thêm, sửa, xóa; form giao dịch, bộ lọc URL, bảng giao dịch và API GET. | Áp dụng code cho `app/transactions/`, `app/api/transactions/route.ts` và các thành phần giao diện. | Tôi chạy thử trên localhost, kiểm tra thêm, xem, sửa, xóa và lọc giao dịch; xác nhận chức năng hoạt động đúng. | `ffac4ca` – fp2 |
| 2026-11-21 | ChatGPT | Bổ sung unit test và hoàn thiện giao diện | Viết test cho Zod và bộ lọc; chỉnh Dashboard, layout, trang chủ và thông báo Sonner. | Bổ sung `validation.test.ts`, `filters.test.ts` và các file giao diện. | Khi typecheck, tôi gặp lỗi TS2305 vì AI dùng `formatVietnamDateInput()` nhưng chưa bổ sung export trong `lib/finance.ts`. Tôi báo lỗi, thêm hàm theo hướng dẫn rồi kiểm tra lại. | `ffac4ca` – fp2 |
| 2026-11-21 | ChatGPT | Nghiệm thu fp2 và chuẩn bị Git | Hướng dẫn kiểm thử tổng thể. | Hoàn thiện mã nguồn và tài liệu trước khi lưu mốc fp2. | ESLint đạt 0 lỗi, 0 warning; typecheck đạt; Vitest đạt 37/37 test trên 7 file; build Next.js 16.4.6 thành công. Tôi viết AI_LOG trước khi commit, tạo tag và push. | `ffac4ca` – `feat(fp2): implement transaction CRUD Zod validation and URL filters`; tag `fp2`, đã push GitHub. |

### 2. Tự đánh giá cuối bài

**Phần mình trực tiếp thực hiện:** Tôi tạo và chỉnh sửa các file theo hướng dẫn, kiểm tra chức năng CRUD và bộ lọc trên localhost, đọc thông báo lỗi, chạy ESLint, TypeScript, Vitest và production build. Tôi rà soát Git và viết nhật ký AI trước khi thực hiện commit, tag và push `fp2`.

**Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:** AI giúp triển khai Server Actions, xác thực đầu vào bằng Zod 4, truy vấn Prisma và lưu trạng thái bộ lọc qua `searchParams`. Tôi hiểu rõ hơn cách frontend, backend và database phối hợp, cũng như vì sao thao tác sửa/xóa cần kiểm tra `userId` bằng điều kiện sở hữu dữ liệu.

**Một lần AI sai và cách mình phát hiện:** AI hướng dẫn import `formatVietnamDateInput()` trong `app/transactions/page.tsx` nhưng chưa định nghĩa hoặc export hàm tương ứng trong `lib/finance.ts`. Khi chạy `npm run typecheck`, TypeScript báo `TS2305: Module has no exported member 'formatVietnamDateInput'`. Tôi gửi lỗi cho AI, bổ sung hàm theo hướng dẫn và chạy lại để xác nhận hết lỗi. Tôi rút ra rằng mã AI đề xuất có thể thiếu đồng bộ giữa các file nên phải kiểm chứng bằng công cụ và thao tác thực tế.

---

## Phiên bản fp3 – Xác thực và phân quyền

### 1. Nhật ký sử dụng AI

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 2026-11-21 | ChatGPT | Tích hợp Better Auth với Prisma | Hướng dẫn Better Auth 1.7, Prisma 7, Neon và tạo bảng xác thực mà không xóa dữ liệu cũ. | Tạo `lib/auth.ts`, `lib/auth-client.ts`, API Auth; bổ sung `session`, `account`, `verification` và migration. | Tôi phát hiện lỗi Prisma P1012 do cú pháp `@relation` AI cung cấp chưa hợp lệ. Sau khi sửa, `prisma format`, `validate`, `generate`, `migrate dev`, `migrate status` đều thành công; database báo đồng bộ. | Chưa commit fp3. |
| 2026-11-21 | ChatGPT | Xây dựng đăng ký và đăng nhập | Hướng dẫn tạo `/register`, `/login` và kết nối API Better Auth cho email/mật khẩu. | Tạo các trang xác thực và Route Handler `/api/auth/[...all]`. | Tôi gặp lỗi 404/500 khi kiểm tra API, `Invalid origin` lúc đăng ký và `INVALID_EMAIL_OR_PASSWORD` lúc đăng nhập. Tôi gửi lỗi để phân tích, chỉnh cấu hình và xác nhận sau đó đăng ký/đăng nhập thành công. | Chưa commit fp3. |
| 2026-11-21 đến 2026-11-22 | ChatGPT | Thay demo bằng session và bảo vệ dữ liệu | Hướng dẫn xác thực trong DAL, Dashboard, Transactions, API và Server Actions theo `userId`. | Cập nhật `lib/dal.ts`, các trang dữ liệu và xử lý thêm, sửa, xóa theo session Better Auth. | Tôi kiểm tra tài khoản mới không thấy giao dịch demo; người chưa đăng nhập bị chuyển về `/login`; API giao dịch từ chối truy cập khi chưa đăng nhập. | Chưa commit fp3. |
| 2026-11-22 | ChatGPT | Hoàn thiện giao diện và xử lý hydration | Đồng bộ Header, nút Sáng/Tối, icon mặt trời/mặt trăng, trạng thái đăng xuất và trang 404. | Cập nhật `app/layout.tsx`, `app/globals.css`, `components/theme-toggle.tsx`, `components/auth-nav.tsx`, `app/not-found.tsx`. | Tôi phát hiện và báo lỗi hydration mismatch, kiểm tra hiệu ứng chuyển màu và trang 404. | Chưa commit fp3. |
| 2026-11-22 | ChatGPT | Tích hợp GitHub OAuth | Hướng dẫn tạo GitHub OAuth App. | Cấu hình OAuth trong `.env`, bổ sung nút **Tiếp tục với GitHub**. | Tôi trực tiếp tạo OAuth App, kiểm tra đăng nhập GitHub thành công và trở lại Dashboard. Sau khi đăng xuất, mở lại Dashboard được chuyển về `/login`. | Chưa commit fp3. |
| 2026-11-22 | ChatGPT | Viết test phân quyền và nghiệm thu | Viết unit test cho session, giới hạn CRUD theo `userId`, API 401 | Tạo `__tests__/authorization.test.ts` với 12 bài test sử dụng mock, không thao tác dữ liệu Neon thật. | **Sau khi tích hợp GitHub OAuth**, tôi chạy lại `npm run lint` và `npm run typecheck` đều đạt; Vitest đạt **49/49 test trên 8 file**; `npm run build` thành công với Next.js 16.4.6 và Prisma 7.10.1. | Chưa commit fp3. |
| 2026-11-22 | ChatGPT | Rà soát Git và tài liệu | Hướng dẫn kiểm tra file tạm, migration, file tự tạo. | Rà soát thay đổi mã nguồn, cấu hình mẫu, tài liệu. | Tôi kiểm tra Git status, xác nhận `.env` được bỏ qua, kiểm tra `next-env.d.ts` và `migration_lock.toml`, dọn file xem trước. Các cảnh báo LF/CRLF được ghi nhận, commit fp3 chưa thực hiện. | Chưa commit fp3. |

### 2. Tự đánh giá cuối bài

**Phần mình trực tiếp thực hiện:** Tôi tạo và chỉnh sửa các file trong dự án, cấu hình Better Auth và các biến môi trường, thực hiện Prisma migration, thiết lập GitHub OAuth App và kiểm tra các luồng đăng ký, đăng nhập, đăng xuất. Tôi thử tài khoản mới để xác nhận dữ liệu tách biệt với tài khoản demo; kiểm tra truy cập Dashboard và API khi chưa đăng nhập. Sau khi tích hợp GitHub OAuth, tôi trực tiếp chạy lại lint, typecheck, 49 bài test trên 8 file và production build thành công.

**Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:** AI giúp tôi hiểu và triển khai session Better Auth, Route Handlers, OAuth và phân quyền ở phía server. Tôi hiểu rằng `userId` phải lấy từ session đã xác thực, không lấy từ URL hay form do client gửi lên; các thao tác CRUD phải lọc theo chủ sở hữu giao dịch. Tôi cũng học cách dùng mock trong Vitest để kiểm tra logic phân quyền mà không ảnh hưởng dữ liệu thật trên Neon.

**Một lần AI sai và cách mình phát hiện:** Trong mã Prisma schema do AI hướng dẫn, khai báo `@relation` tại `Session` và `Account` có cú pháp không hợp lệ, khiến `npx prisma format` báo lỗi **P1012**. Tôi đối chiếu dòng lỗi, gửi lại thông báo và sửa khai báo theo hướng dẫn. Sau đó `prisma validate`, `prisma generate`, migration và typecheck đều thành công. Các lỗi `Invalid origin` và hydration trong quá trình phát triển cũng giúp tôi nhận thấy cần xác định lỗi bằng Terminal, trình duyệt và kiểm thử thực tế, không chỉ tin vào giải pháp AI đề xuất.

**Kết luận tự đánh giá:** AI tham gia đáng kể vào việc đề xuất cấu trúc, mã nguồn, phân tích lỗi và bài kiểm thử. Tôi trực tiếp thao tác, cấu hình dịch vụ, kiểm chứng kết quả và chịu trách nhiệm về sản phẩm. Phiên bản fp3 đã kiểm thử kỹ thuật và các luồng xác thực chính; tại thời điểm viết nhật ký, **chưa commit, chưa tạo tag `fp3` và chưa push GitHub**.
