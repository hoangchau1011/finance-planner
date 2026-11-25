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

## v1.0 — Xây dựng chức năng Wishlist CRUD

### 1. Nhật ký sử dụng AI

| Ngày | Công cụ AI | Công việc | Nội dung yêu cầu | AI hỗ trợ | Việc tôi thực hiện | Kết quả | Trạng thái |
|---|---|---|---|---|---|---|---|
| 2026-11-24 | ChatGPT | Lập kế hoạch phát triển v1.0 | Hướng dẫn nâng cấp Finance Planner từ fp3 lên v1.0, ưu tiên chức năng Wishlist CRUD và chia nhỏ theo từng file. | Đề xuất cấu trúc file, trình tự triển khai và các bước kiểm tra. | Tôi thực hiện lần lượt từng file, giữ nguyên những chức năng đã hoàn thành ở fp3. | Xác định phạm vi triển khai Wishlist CRUD và kế hoạch kiểm thử. | Hoàn thành kế hoạch. |
| 2026-11-24 | ChatGPT | Xây dựng Wishlist Validation | Hướng dẫn tạo `lib/wishlist-validation.ts` bằng Zod 4 để kiểm tra dữ liệu mục tiêu tài chính. | Cung cấp mã nguồn kiểm tra tên, chi phí, mức ưu tiên và ID mục tiêu. | Tôi tạo file, tích hợp mã nguồn, chạy TypeScript và ESLint để kiểm tra. | Hoàn thành kiểm tra dữ liệu đầu vào Wishlist. | Đã kiểm tra. |
| 2026-11-24 | ChatGPT | Xây dựng Wishlist Server Actions | Hướng dẫn tạo chức năng thêm, sửa, xóa Wishlist và phân quyền bằng Better Auth. | Hỗ trợ xây dựng `app/wishlist/actions.ts`, kiểm tra session và giới hạn truy vấn theo `userId`. | Tôi triển khai mã nguồn, kiểm tra các thao tác Prisma và chạy lệnh kiểm tra dự án. | Hoàn thành các Server Actions cho Wishlist CRUD. | Đã kiểm tra. |
| 2026-11-24 | ChatGPT | Xây dựng giao diện Wishlist | Hướng dẫn tạo form thêm/sửa, bảng danh sách, xác nhận xóa và trang `/wishlist`. | Cung cấp mã nguồn `wishlist-form.tsx`, `wishlist-table.tsx`, `page.tsx` và hướng dẫn tích hợp Sonner. | Tôi tạo các file, kiểm tra giao diện, thử các chức năng CRUD trên localhost. | Hoàn thành giao diện quản lý Wishlist và kết nối dữ liệu người dùng. | Đã kiểm tra. |
| 2026-11-24 | ChatGPT | Tích hợp Wishlist vào hệ thống | Hướng dẫn cập nhật Header và Dashboard để truy cập Wishlist và hiển thị các mục tiêu gần nhất. | Đề xuất chỉnh sửa `app/layout.tsx` và `app/dashboard/page.tsx`, bổ sung điều hướng và trạng thái danh sách rỗng. | Tôi chỉnh sửa các thành phần hiện có, kiểm tra điều hướng và chức năng cũ. | Wishlist được tích hợp vào Header và Dashboard. | Đã kiểm tra. |
| 2026-11-24 | ChatGPT | Thiết lập đăng nhập tài khoản demo | Hướng dẫn sử dụng `demo@phy10615.vn` để kiểm thử dữ liệu mẫu đã seed mà không làm mất dữ liệu. | Giải thích vấn đề tài khoản demo chưa có mật khẩu và cung cấp script tạm thời để thiết lập đăng nhập bằng Better Auth. | Tôi tự chọn mật khẩu, chạy script, đăng nhập và kiểm tra dữ liệu mẫu. | Đăng nhập thành công; xác nhận 45 giao dịch và 4 mục tiêu Wishlist. | Hoàn thành đăng nhập demo. |
| 2026-11-24 | ChatGPT | Kiểm thử Wishlist CRUD | Hướng dẫn xây dựng bộ kiểm thử bằng Vitest cho validation, thêm, sửa, xóa và phân quyền. | Cung cấp 23 trường hợp kiểm thử trong `__tests__/wishlist.test.ts`, sử dụng mock session và Prisma. | Tôi tạo file kiểm thử, chạy Vitest, TypeScript, ESLint và production build. | Các bước kiểm tra được thực hiện thành công theo kết quả trên máy cá nhân. | Đã kiểm tra. |
| 2026-11-25 | ChatGPT | Cập nhật tài liệu AGENTS.md | Hướng dẫn cập nhật tài liệu kỹ thuật cho Wishlist CRUD và kiểm tra các file thay đổi trước commit. | Đề xuất nội dung tài liệu và các lệnh `git diff`, `git diff --check`, `git status`. | Tôi cập nhật `AGENTS.md`, kiểm tra Git status và các cảnh báo LF/CRLF. | Không phát hiện lỗi khoảng trắng; các thay đổi v1.0 chưa được commit. | Chưa commit v1.0. |
| 2026-11-25 | ChatGPT | Cập nhật nhật ký AI_LOG.md | Hướng dẫn tổng hợp nhật ký sử dụng AI và phần tự đánh giá cho phiên bản v1.0 theo cấu trúc tài liệu hiện có. | Soạn nội dung mô tả quá trình thực hiện, công việc AI hỗ trợ, kết quả kiểm thử và các vấn đề đã xử lý. | Tôi rà soát nội dung, yêu cầu bổ sung bảng nhật ký 8 cột để thống nhất với các phiên bản trước. | Bổ sung nhật ký v1.0; chờ duyệt nội dung cuối cùng trước khi commit và push. | Đang hoàn thiện tài liệu. |

**Các nội dung AI hỗ trợ:**

- **Phân tích và lập kế hoạch:** AI hỗ trợ chia chức năng Wishlist CRUD thành từng bước, xác định các file cần tạo mới và các file cần chỉnh sửa.
- **Kiểm tra dữ liệu:** AI hỗ trợ xây dựng `lib/wishlist-validation.ts` bằng Zod 4 để kiểm tra tên mục tiêu, số tiền và mức độ ưu tiên.
- **Xử lý nghiệp vụ:** AI hướng dẫn xây dựng `app/wishlist/actions.ts` với các Server Actions để thêm, sửa và xóa mục tiêu tài chính.
- **Xác thực và phân quyền:** AI hỗ trợ tích hợp Better Auth, lấy `userId` từ session và giới hạn các thao tác trên dữ liệu thuộc tài khoản đang đăng nhập.
- **Xây dựng giao diện:** AI hỗ trợ tạo `wishlist-form.tsx`, `wishlist-table.tsx` và trang `/wishlist`, kết hợp React 19, Tailwind CSS và Sonner.
- **Tích hợp Dashboard:** AI hướng dẫn bổ sung liên kết Wishlist trên Header, hiển thị các mục tiêu gần nhất và điều hướng đến trang quản lý.


**Quá trình thực hiện:**

Tôi lần lượt tạo và chỉnh sửa các file theo hướng dẫn, kiểm tra TypeScript và ESLint sau từng bước, sau đó kiểm thử các chức năng trên trình duyệt.

Sau khi hoàn thành Wishlist CRUD, tôi chạy kiểm thử Vitest và kiểm tra production build. Các bước kiểm tra được thực hiện thành công theo kết quả trên máy cá nhân.

Trong quá trình kiểm thử, tôi sử dụng tài khoản `demo@phy10615.vn` đã được tạo ở phiên bản trước.

Thiết lập phương thức đăng nhập bằng Better Auth mà không thay đổi dữ liệu đã lưu. Sau khi thực hiện, tôi đăng nhập thành công và xác nhận tài khoản demo có **45 giao dịch và 4 mục tiêu Wishlist**.

### 2. Tự đánh giá cuối bài

**a) Những công việc tôi tự thực hiện**

- Trực tiếp tạo và chỉnh sửa các file mã nguồn trong VS Code.
- Tổ chức thư mục và tích hợp các thành phần Wishlist vào dự án.
- Thực hiện các lệnh kiểm tra TypeScript, ESLint, Vitest và production build.
- Kiểm tra giao diện và các chức năng thêm, sửa, xóa mục tiêu.
- Đăng nhập tài khoản demo và kiểm tra dữ liệu đã có trong Neon PostgreSQL.
- Kiểm tra các thay đổi bằng Git và rà soát tài liệu trước khi commit.

**b) Những công việc AI hỗ trợ**

- Phân tích yêu cầu và đề xuất cách chia nhỏ chức năng Wishlist CRUD.
- Cung cấp mã nguồn tham khảo và hướng dẫn chỉnh sửa từng file.
- Giải thích cách kết hợp Zod 4, React Hooks, Next.js Server Actions và Prisma.
- Đề xuất cách phân quyền theo tài khoản để tránh truy cập dữ liệu của người dùng khác.
- Hỗ trợ xây dựng bộ kiểm thử Vitest.

**c) Lỗi, vấn đề gặp phải và cách khắc phục**

- **Tài khoản demo chưa đăng nhập được:** Tài khoản được tạo từ dữ liệu seed nhưng chưa có phương thức đăng nhập bằng mật khẩu. Tôi thực hiện script thiết lập mật khẩu theo hướng dẫn của AI và đăng nhập thành công.
- **Nguy cơ truy cập dữ liệu giữa các tài khoản:** Các Server Actions được thiết kế để lấy `userId` từ session Better Auth, đồng thời giới hạn truy vấn sửa và xóa theo cả ID mục tiêu và ID người dùng.
- **Cảnh báo LF/CRLF trên Windows:** Git xuất hiện cảnh báo chuyển đổi ký tự xuống dòng. Tôi sử dụng `git diff --check` để kiểm tra và không phát hiện lỗi khoảng trắng.
- **Kiểm thử dữ liệu:** Tôi sử dụng tài khoản demo có sẵn dữ liệu để kiểm tra chức năng mà không cần tạo lại toàn bộ giao dịch và mục tiêu mẫu.

**d) Kết quả và tự đánh giá**

Trong phiên bản v1.0, tôi đã hoàn thành các nội dung:

- Thêm, sửa và xóa mục tiêu tài chính.
- Kiểm tra dữ liệu đầu vào bằng Zod 4.
- Hiển thị danh sách Wishlist và mức độ ưu tiên.
- Tích hợp Wishlist vào Dashboard và thanh điều hướng.
- Hiển thị thông báo kết quả và xác nhận trước khi xóa.
- Giới hạn truy cập dữ liệu theo tài khoản đăng nhập.
- Xây dựng 23 bài kiểm thử mới cho chức năng Wishlist.
- Kiểm tra TypeScript, ESLint, Vitest và production build.

**Các nội dung chưa triển khai:** Biểu đồ tài chính nâng cao bằng shadcn Chart, các tính năng mở rộng, component test và GitHub Actions CI.

**Tự đánh giá:** AI hỗ trợ tôi trong quá trình phân tích, viết mã nguồn tham khảo và thiết kế kiểm thử. Tôi trực tiếp triển khai, chạy chương trình, kiểm tra kết quả và lựa chọn những thay đổi phù hợp với dự án. Qua quá trình thực hiện, tôi hiểu thêm về Server Actions, kiểm tra dữ liệu bằng Zod, quản lý session và bảo vệ dữ liệu theo người dùng.