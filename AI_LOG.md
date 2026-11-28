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

---

## v1.0 — Xây dựng chức năng Wishlist CRUD, hoàn thiện Finance Planner và phát triển tính năng mở rộng

### 1. Nhật ký sử dụng AI

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 25–26/11/2026 | ChatGPT | Phát triển báo cáo tài chính | Hướng dẫn xây dựng trang Reports, phân tích thu chi, biểu đồ và thống kê theo tháng. | Bổ sung trang `/reports`, các hàm tổng hợp dữ liệu và biểu đồ Recharts. | Tạo các file theo hướng dẫn, chạy TypeScript, lint và kiểm thử trong quá trình tích hợp. | 0699eb8 – v1.0 |
| 25–26/11/2026 | ChatGPT | Mở rộng quản lý ngân sách | Xây dựng ngân sách theo danh mục từng tháng, cảnh báo 80% và 100%, tích hợp Dashboard. | Bổ sung model `MonthlyBudget`, migration, validation, Server Actions và giao diện `/budgets`. | Thực hiện migration, Prisma generate; kiểm tra thao tác ngân sách và bổ sung 26 unit test. | 0699eb8 – v1.0 |
| 26/11/2026 | ChatGPT | Nâng cấp Wishlist Savings | Thêm tiền tiết kiệm riêng cho từng mục tiêu, theo dõi tiến độ và thông báo mốc. | Bổ sung `savedAmount`, migration, form tiết kiệm, kiểm tra quyền sở hữu và giới hạn số tiền. | Kiểm tra lỗi khi cập nhật mục tiêu, sửa điều kiện truy vấn và chạy 29 bài kiểm thử Wishlist. | 0699eb8 – v1.0 |
| 26/11/2026 | ChatGPT | Cải tiến Dashboard và giao dịch | Thêm thẻ thống kê, tổng quan ngân sách, tìm kiếm và xuất CSV. | Tạo các component Dashboard, tìm kiếm mô tả giao dịch và Route Handler xuất CSV. | Kiểm tra TypeScript, lint, Vitest và sửa các lỗi tích hợp phát sinh. | 0699eb8 – v1.0 |
| 26–27/11/2026 | ChatGPT | Thiết kế lại giao diện trang chủ | Xây dựng landing page chuyên nghiệp, responsive, hỗ trợ Dark Mode và giới thiệu các tính năng. | Cập nhật `app/page.tsx`, tạo các khu vực giới thiệu và Dashboard Preview. | Kiểm tra build, giao diện trên localhost và điều chỉnh các thành phần hiển thị. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Xây dựng Guest Demo | Tạo chế độ dùng thử không cần đăng nhập, sử dụng dữ liệu mô phỏng độc lập với Neon. | Tạo `guest-demo-data.ts` và trang `/demo` với Dashboard, CRUD giao dịch, ngân sách và Wishlist mô phỏng. | Chạy các lệnh kiểm tra; kiểm tra đường dẫn import và xử lý vấn đề hiển thị trong VS Code. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Hoàn thiện Header, Footer và Dark Mode | Thiết kế menu responsive, đồng bộ Footer và tự ẩn mục Khám phá khi đăng nhập. | Bổ sung `SiteNavigation`, `SiteFooter` và kiểm tra session bằng Better Auth. | Kiểm tra giao diện, trạng thái đăng nhập và bổ sung component test. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Xây dựng chức năng Mô phỏng tài chính | Phát triển tính năng dự đoán thời gian đạt mục tiêu Wishlist, điều chỉnh tiết kiệm và so sánh kịch bản. | Tạo `lib/financial-simulator.ts`, giao diện mô phỏng, biểu đồ tích lũy và trang `/simulator`. | Kiểm tra công thức, chạy 26 unit test, typecheck và lint thành công. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Kết nối mô phỏng với Neon | Đọc dữ liệu Wishlist và giao dịch 3 tháng trước theo tài khoản đăng nhập. | Tích hợp `requireUser()`, truy vấn Prisma theo `userId` và truyền dữ liệu vào component mô phỏng. | Khi chưa đăng nhập, phát hiện `UnauthorizedError`; bổ sung xử lý chuyển hướng đến `/login` mà không bỏ kiểm tra quyền. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Kiểm thử tích hợp mô phỏng | Viết test kiểm tra xác thực, phân quyền và dữ liệu truyền vào trang mô phỏng. | Tạo `simulator-page.test.ts` với 9 bài kiểm thử dùng mock. | Phát hiện cấu hình Vitest không nhận `.test.tsx`, đổi thành `.test.ts`; kiểm thử toàn dự án đạt 158/158 bài. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Bổ sung Component Test | Kiểm thử Footer theo trạng thái đăng nhập bằng React Testing Library. | Tạo `site-footer.test.ts` và bổ sung 6 bài component test. | Phát hiện thiếu `jsdom`, bổ sung thư viện kiểm thử; xác nhận các lệnh kiểm tra đạt, tổng cộng 164 bài test. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Thiết lập GitHub Actions CI | Tạo workflow tự động kiểm tra lint, typecheck, test và build khi push hoặc tạo Pull Request. | Tạo `.github/workflows/ci.yml`, dùng PostgreSQL tạm thời cho CI. | Kiểm tra đường dẫn, nội dung file và trạng thái Git. Chưa xác nhận workflow chạy thành công trên GitHub. | 0699eb8 – v1.0 |
| 27/11/2026 | ChatGPT | Hoàn thiện tài liệu dự án | Cập nhật README, AGENTS, biến môi trường mẫu và chuẩn bị AI_LOG. | AI hướng dẫn cập nhật tài liệu cho Finance Planner v1.0 và chuẩn bị triển khai Vercel. | Đối chiếu nội dung dự thảo với dự án; cần xác nhận các thay đổi tài liệu đã lưu đầy đủ trước khi commit. | 0699eb8 – v1.0 |
| 28/11/2026 | ChatGPT | Rà soát giao diện đăng ký sau khi deploy Vercel | Sửa thông báo đăng nhập chưa được bổ sung và nội dung hiển thị sau khi đăng ký thành công. | Cập nhật `app/register/page.tsx`, thêm liên kết `/login` và nút "Đăng nhập ngay" sau khi đăng ký thành công. | Phát hiện nội dung cũ khi kiểm tra production; kiểm chứng lại sau khi sửa và chạy các lệnh kiểm tra. | 0699eb8 – v1.0 |


### 2. Những tính năng mở rộng đã thực hiện

**Các chức năng mở rộng theo danh sách gợi ý của giảng viên:**

- Quản lý ngân sách theo danh mục và tháng, cảnh báo tại ngưỡng 80% và 100%.
- Báo cáo phân tích tài chính, so sánh thu nhập và chi tiêu giữa các tháng.
- Xuất danh sách giao dịch ra CSV theo bộ lọc.

**Các cải tiến và tính năng bổ sung:**

- Theo dõi tiền tiết kiệm thực tế (`savedAmount`) cho từng mục tiêu Wishlist.
- Tìm kiếm giao dịch theo mô tả.
- Mô phỏng tài chính dựa trên dữ liệu giao dịch và Wishlist, dự đoán thời gian đạt mục tiêu theo các kịch bản.
- Guest Demo cho phép trải nghiệm ứng dụng không cần tài khoản và không ghi dữ liệu thật.
- Cải tiến Dashboard, trang chủ, Header, Footer, responsive và Dark Mode.

### 3. Các lỗi phát hiện và cách khắc phục

**Lỗi 1 – Truy cập trang mô phỏng khi chưa đăng nhập**

- Hiện tượng: `requireUser()` phát sinh `UnauthorizedError`, làm Next.js hiển thị trang lỗi.
- Nguyên nhân: Code ban đầu chưa xử lý chuyển hướng khi không có session.
- Khắc phục: Bắt riêng `UnauthorizedError` và chuyển đến `/login`, vẫn giữ kiểm tra phân quyền phía server.

**Lỗi 2 – Vitest không tìm thấy file kiểm thử**

- Hiện tượng: `No test files found`.
- Nguyên nhân: AI đề xuất tên `simulator-page.test.tsx`, trong khi cấu hình Vitest chỉ nhận `*.test.ts`.
- Khắc phục: Đổi đuôi file thành `.test.ts`, chạy lại và xác nhận kiểm thử đạt.

**Lỗi 3 – Thiếu thư viện môi trường kiểm thử**

- Hiện tượng: `Cannot find package 'jsdom'`.
- Nguyên nhân: Component test yêu cầu môi trường DOM giả lập nhưng package chưa được cài.
- Khắc phục: Bổ sung dependency kiểm thử còn thiếu, sau đó chạy lại Vitest.

**Bài học:** Cần kiểm tra mã do AI cung cấp bằng TypeScript, ESLint, Vitest, production build và thử nghiệm thực tế. Không mặc định mọi đề xuất của AI đều hoàn chỉnh.

### 4. Kết quả kiểm thử phiên bản v1.0

| Hạng mục | Kết quả |
|---|---|
| Unit test bộ mô phỏng tài chính | 26 test đạt |
| Test tích hợp trang mô phỏng | 9 test đạt |
| Component test Footer | 6 test đạt |
| Tổng kiểm thử trước khi bổ sung component test | 158/158 |
| Tổng kiểm thử sau khi bổ sung component test | 164 bài test đạt |
| TypeScript, ESLint | Đã được kiểm tra đạt trong quá trình phát triển |
| Production build | Đã build thành công trên máy local và Vercel |
| GitHub Actions CI | Success – Workflow Finance Planner CI #1, commit `0699eb8`, ngày 27/11/2026 |
| Vercel production | Đã build thành công sau khi cấu hình Neon; đang kiểm thử đăng nhập và các chức năng production |

*Lưu ý: Các bài test thành phần nằm trong tổng số test toàn dự án, không cộng thêm vào tổng 164.*

### 5. Tự đánh giá phiên bản v1.0

**Phần mình trực tiếp thực hiện:** Tôi tạo và chỉnh sửa các file theo hướng dẫn, cấu hình môi trường phát triển, chạy migration, kiểm tra giao diện trên localhost, thực hiện các lệnh kiểm thử, đọc thông báo lỗi và điều chỉnh code khi phát hiện vấn đề. Tôi kiểm tra trạng thái Git và quyết định việc commit/push sau khi rà soát.

**Phần AI hỗ trợ nhiều nhất:** AI hỗ trợ thiết kế cấu trúc các tính năng mở rộng, cung cấp mã nguồn, xây dựng công thức mô phỏng, tạo giao diện, viết unit test và phân tích lỗi.

**Kiến thức và kinh nghiệm thu được:** Tôi hiểu rõ hơn cách sử dụng Prisma với Neon, xác thực Better Auth, phân quyền theo `userId`, quản lý React state, Server Components, Client Components, mô phỏng dữ liệu bằng hàm thuần và kiểm thử bằng Vitest.

**Một lần AI sai và cách phát hiện:** AI hướng dẫn sử dụng file `.test.tsx` không phù hợp với cấu hình Vitest hiện tại. Tôi phát hiện thông qua Terminal, đổi đuôi file và chạy lại kiểm thử thành công. Điều này cho thấy cần đối chiếu hướng dẫn AI với cấu hình thực tế của dự án.
