# AI_LOG – Nhật ký sử dụng AI

> Mức AI của bài này: **Mức 4 – AI toàn phần có kiểm soát**.
> Khai báo trung thực: không ghi những kiểm tra hay commit chưa thực hiện.


## 1. Nhật ký sử dụng AI

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 2026-11-20 | ChatGPT | Phân tích đề bài và lập kế hoạch | Đối chiếu code mẫu Tuần 7, 8, 9 với yêu cầu PHY10615; lập kế hoạch triển khai Finance Planner. | AI xây dựng bảng đối chiếu, cấu trúc thư mục, danh sách thư viện và lộ trình fp1–v1.0. | Tôi đối chiếu kế hoạch với các yêu cầu công nghệ và lựa chọn triển khai theo từng file để dễ theo dõi, kiểm tra. | Giai đoạn lập kế hoạch, chưa có commit riêng được xác nhận. |
| 2026-11-20 | ChatGPT | Xây dựng nền tảng fp1 | Tạo ứng dụng Next.js 16.4, Prisma 7, PostgreSQL Neon, dữ liệu mẫu và Dashboard từ code giảng viên. | AI tạo bộ mã fp1 gồm schema, migration, seed 42 giao dịch, 3 wishlist và Dashboard chỉ đọc. | Tôi trực tiếp thiết lập Neon, cấu hình `.env` và chạy các lệnh cài đặt, migration, generate và seed. Đã báo hoàn tất 4 lệnh. | `0057a75` – `feat(fp1): setup Prisma Neon seed and dashboard` |
| 2026-11-20 | ChatGPT | Kiểm tra và hoàn thiện fp1 | Chạy lint, typecheck, Vitest, production build và quản lý mã nguồn bằng Git. | Sử dụng các lệnh AI hướng dẫn để kiểm tra chất lượng project. | `npm run lint`: 0 lỗi, 1 warning ở `postcss.config.mjs`; `npm run typecheck`: đạt; Vitest: 13/13 test đạt; `npm run build`: thành công. Tôi cũng kiểm tra `.env` được Git bỏ qua, `git diff --cached --check` không báo lỗi và working tree sạch sau commit. | Commit `0057a75`, tag local `fp1`. Chưa có xác nhận đã push GitHub. |
| 2026-11-21 | ChatGPT | Xây dựng validation và truy vấn giao dịch fp2 | Hướng dẫn bổ sung Zod 4, Sonner, Data Access Layer và lọc giao dịch theo người dùng. | Tạo `lib/dal.ts`, `lib/validation.ts`, `lib/transaction-queries.ts`. | Đã cung cấp kết quả typecheck đạt sau khi tạo Server Actions ở file 4. Việc cài đặt hai thư viện cần đối chiếu lại với `package.json`. | Chưa commit fp2. |
| 2026-11-21 | ChatGPT | Xây dựng CRUD giao dịch và API | Viết Server Actions thêm, sửa, xóa; form React; bộ lọc URL; bảng giao dịch; API GET. | AI cung cấp mã nguồn cho trang Transactions, form, filters, table, actions và Route Handler. | Tôi chạy `npm run typecheck` và `npm run lint` sau file 4; typecheck đạt, ESLint không có lỗi nhưng còn 1 warning cũ. Tôi đã chạy Finance Planner trên localhost và trực tiếp kiểm tra các chức năng giao dịch đã triển khai, xác nhận giao diện và các thao tác hoạt động đúng. Việc kiểm thử tự động tổng thể và kiểm tra API cần được xác nhận riêng. | Chưa commit fp2. |
| 2026-11-21 | ChatGPT | Bổ sung unit test và chỉnh sửa giao diện fp2 | Viết test Zod, bộ lọc Prisma; cập nhật layout, Dashboard, trang chủ và Sonner. | AI hướng dẫn viết `validation.test.ts`, `filters.test.ts` và chỉnh sửa các file giao diện. | Khi chạy `npm run typecheck`, tôi phát hiện lỗi TS2305 do `formatVietnamDateInput()` chưa được export trong `lib/finance.ts`. Tôi gửi lỗi cho AI và nhận hướng dẫn bổ sung hàm. Tôi đã kiểm tra ứng dụng trên localhost và xác nhận các chức năng hoạt động đúng. Kết quả lint, typecheck, Vitest và production build cuối đợt đang chờ kiểm tra. | Chưa commit fp2. |
| 2026-11-21 | ChatGPT  | Hoàn thiện tài liệu AI_LOG | Cập nhật mức AI sử dụng và điền thông tin từ quá trình thực hiện. | AI tổng hợp nhật ký fp1–fp2, kết quả kiểm thử, những lỗi được báo cáo và tình trạng Git. | Tôi yêu cầu chỉnh sửa AI_LOG để phản ánh quá trình phát triển. Bản nhật ký này cần được tôi đọc và đối chiếu lần cuối trước khi sử dụng để nộp bài. | Chưa commit bản cập nhật AI_LOG. |


## Tự đánh giá cuối bài

- **Phần mình tự làm hoàn toàn:**

  Tôi trực tiếp tạo và cấu hình cơ sở dữ liệu PostgreSQL trên Neon, thiết lập các biến môi trường trong file `.env`, thực hiện migration và seed dữ liệu. Tôi thao tác trên Visual Studio Code để tạo, chỉnh sửa các file theo hướng dẫn của AI, đồng thời chạy các lệnh kiểm tra và xử lý lỗi phát sinh. Tôi cũng tự khởi tạo Git, kiểm tra `.gitignore` để tránh đưa thông tin bí mật lên GitHub, tạo commit `0057a75` và git tag `fp1`. Đối với fp2, tôi đã trực tiếp chạy ứng dụng trên localhost, kiểm tra giao diện và các chức năng đã triển khai, xác nhận ứng dụng hoạt động đúng.

- **Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:**

  AI hỗ trợ tôi nhiều nhất trong việc xây dựng cấu trúc dự án Next.js 16.4 với TypeScript, kết nối Prisma ORM 7 với Neon và phát triển chức năng quản lý giao dịch. Qua quá trình thực hiện, tôi được hướng dẫn cách sử dụng Server Actions để thêm, sửa, xóa dữ liệu; Zod 4 để kiểm tra dữ liệu đầu vào; Prisma để truy vấn database và `searchParams` để lưu bộ lọc trên URL. Tôi cũng được giải thích tầm quan trọng của việc lọc dữ liệu theo `userId` và sử dụng `updateMany`/`deleteMany` để kiểm soát quyền sở hữu giao dịch. Sau khi áp dụng code, tôi đã chạy thử ứng dụng trên localhost và xác nhận các chức năng hoạt động đúng. Quá trình này giúp tôi hiểu rõ hơn cách các thành phần frontend, backend và database phối hợp với nhau.

- **Một lần AI sai và cách mình phát hiện:**

  Khi thực hiện đợt `fp2`, AI hướng dẫn tôi import hàm `formatVietnamDateInput()` trong file `app/transactions/page.tsx` nhưng chưa bổ sung hàm này vào `lib/finance.ts`. Khi chạy `npm run typecheck`, TypeScript báo lỗi `TS2305: Module has no exported member 'formatVietnamDateInput'`. Sau khi xác định nguyên nhân và nhận hướng dẫn bổ sung hàm vào `lib/finance.ts`. Từ trường hợp này, tôi nhận ra rằng code do AI tạo có thể thiếu sự đồng bộ giữa các file, vì vậy cần kiểm tra bằng TypeScript, ESLint, unit test và chạy thử ứng dụng thay vì chỉ sao chép mã nguồn.
