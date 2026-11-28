
# Finance Planner v1.0

**Đồ án cá nhân môn PHY10615 – Phát triển ứng dụng web**  
Học kỳ 1, năm học 2026–2027.

Finance Planner là ứng dụng quản lý tài chính cá nhân,
giúp người dùng theo dõi thu nhập, chi tiêu, lập ngân sách
và quản lý các mục tiêu tiết kiệm.

Ứng dụng hỗ trợ báo cáo trực quan và mô phỏng những
kịch bản tài chính để người dùng chủ động lên kế hoạch.

## 1. Liên kết

- GitHub: https://github.com/hoangchau1011/finance-planner
- Production Vercel: https://finance-planner-beige-pi.vercel.app/
- Trạng thái: Đã build thành công trên Vercel, đang kiểm thử các chức năng production.
- Guest Demo: `/demo` (không cần đăng nhập)
- AI Log: [AI_LOG.md](./AI_LOG.md)
- Luật dự án: [AGENTS.md](./AGENTS.md)

**Lưu ý:** Tài khoản demo phục vụ chấm bài sẽ được
cung cấp riêng cho giảng viên sau khi deploy.
Không công khai mật khẩu trên GitHub.

## 2. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.4, App Router |
| Giao diện | React 19, TypeScript 5 |
| CSS | Tailwind CSS v4 |
| UI | shadcn/ui, Radix |
| Database | PostgreSQL trên Neon |
| ORM | Prisma ORM 7 |
| Authentication | Better Auth 1.7 |
| Validation | Zod 4 |
| Biểu đồ | Recharts |
| Thông báo | Sonner |
| Testing | Vitest 5, React Testing Library |
| CI | GitHub Actions |
| Hosting | Vercel |

## 3. Tính năng cốt lõi

### 3.1. Xác thực và phân quyền

- Đăng ký tài khoản bằng email và mật khẩu.
- Đăng nhập bằng email và mật khẩu.
- Đăng nhập bằng GitHub OAuth.
- Đăng xuất và quản lý session.
- Bảo vệ dữ liệu theo userId.
- Chặn truy cập trái phép vào các trang cá nhân.

### 3.2. Quản lý giao dịch

- Thêm, xem, sửa và xóa giao dịch.
- Phân loại thu nhập và chi tiêu.
- Quản lý danh mục, ngày, mô tả và số tiền VND.
- Kiểm tra dữ liệu đầu vào bằng Zod.
- Hiển thị thông báo bằng Sonner.

### 3.3. Lọc và tìm kiếm

- Lọc theo tháng hoặc toàn bộ thời gian.
- Lọc theo loại thu nhập/chi tiêu.
- Lọc theo danh mục.
- Tìm kiếm giao dịch theo mô tả.
- Lưu bộ lọc trên URL searchParams.
- Lọc dữ liệu phía server theo tài khoản.

### 3.4. Dashboard

- Hiển thị số dư hiện tại.
- Thống kê tổng thu nhập và tổng chi tiêu.
- Biểu đồ tài chính.
- Thống kê chi tiêu theo danh mục.
- Theo dõi Wishlist và ngân sách.

### 3.5. Wishlist

- Thêm, xem, sửa và xóa mục tiêu.
- Quản lý tên, chi phí và mức ưu tiên.
- Theo dõi tiến độ tiết kiệm.
- Thông báo các mốc 50%, 75% và 100%.

## 4. Tính năng mở rộng

### 4.1. Ngân sách theo tháng

- Thiết lập hạn mức theo danh mục.
- Theo dõi số tiền đã chi và còn lại.
- Cảnh báo tại ngưỡng 80% và 100%.
- Hiển thị tiến độ ngân sách trên Dashboard.

### 4.2. Báo cáo tài chính

- Báo cáo thu nhập và chi tiêu.
- So sánh xu hướng tài chính giữa các tháng.
- Biểu đồ trực quan bằng Recharts.

### 4.3. Xuất CSV

- Xuất giao dịch sang file CSV.
- Áp dụng các bộ lọc đang chọn.
- Giới hạn dữ liệu xuất theo tài khoản.
- Hỗ trợ nội dung tiếng Việt.

### 4.4. Mô phỏng tài chính

- Chọn mục tiêu tiết kiệm từ Wishlist.
- Phân tích dòng tiền trong 3 tháng đã hoàn thành.
- Ước tính khả năng tiết kiệm hằng tháng.
- Điều chỉnh khoản tiết kiệm dự kiến.
- So sánh thời gian đạt mục tiêu theo hai kịch bản.
- Tính khoản tiết kiệm cần thiết theo thời hạn.
- Hiển thị biểu đồ tích lũy dự kiến.
- Không ghi các thay đổi mô phỏng vào database.

## 5. Các cải tiến bổ sung

- Ghi nhận savedAmount riêng cho từng Wishlist.
- Cho phép bổ sung tiền tiết kiệm vào mục tiêu.
- Ngăn tiết kiệm vượt chi phí mục tiêu.
- Guest Demo hoạt động không cần đăng nhập.
- Dữ liệu Guest Demo độc lập với Neon.
- Giao diện responsive cho desktop và mobile.
- Dark Mode.
- Dashboard loading skeleton.
- Header và Footer theo trạng thái đăng nhập.
- Trang chủ giới thiệu tính năng và hướng dẫn dùng thử.

## 6. Các trang chính

| Route | Mục đích |
|---|---|
| `/` | Trang giới thiệu |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/dashboard` | Tổng quan tài chính |
| `/transactions` | Quản lý giao dịch |
| `/reports` | Báo cáo |
| `/budgets` | Ngân sách |
| `/wishlist` | Mục tiêu tiết kiệm |
| `/simulator` | Mô phỏng tài chính |
| `/demo` | Guest Demo |

Các trang chứa dữ liệu cá nhân yêu cầu session hợp lệ.
Trang chủ, đăng nhập, đăng ký và Guest Demo có thể
truy cập mà không cần đăng nhập.

## 7. Cài đặt trên máy local

### Yêu cầu

- Node.js 24
- npm
- PostgreSQL Neon
- Git

### Cài đặt

Clone repository:

```bash
git clone https://github.com/hoangchau1011/finance-planner.git
cd finance-planner
```

Cài dependencies:

```bash
npm ci
```

Sao chép `.env.example` thành `.env` và điền các
biến môi trường thực tế của máy phát triển.

Tạo Prisma Client:

```bash
npx prisma generate
```

Áp dụng migration trên database phát triển:

```bash
npx prisma migrate dev
```

Chỉ khi cần tạo dữ liệu mẫu trên database phát triển:

```bash
npx prisma db seed
```

Chạy ứng dụng:

```bash
npm run dev
```

Mở:

http://localhost:3000

**Không chạy seed trên database production nếu chưa
kiểm tra chính xác dữ liệu sẽ được tạo hoặc cập nhật.**

## 8. Biến môi trường

Các biến chính:

| Biến | Vai trò |
|---|---|
| DATABASE_URL | Kết nối PostgreSQL cho ứng dụng |
| DATABASE_URL_UNPOOLED | Kết nối trực tiếp cho Prisma CLI |
| BETTER_AUTH_SECRET | Khóa ký session |
| BETTER_AUTH_URL | URL chính của ứng dụng |
| GITHUB_CLIENT_ID | GitHub OAuth Client ID |
| GITHUB_CLIENT_SECRET | GitHub OAuth Client Secret |

Tham khảo `.env.example`.

Không commit `.env`, `.env.local` hoặc bất kỳ
thông tin bí mật nào.

## 9. Kiểm thử

Kiểm tra ESLint:

```bash
npm run lint
```

Kiểm tra TypeScript:

```bash
npm run typecheck
```

Chạy unit test và component test:

```bash
npx vitest run
```

Kiểm tra production build:

```bash
npm run build
```

Tại thời điểm chuẩn bị tài liệu (27/11/2026),
bộ kiểm thử trên máy phát triển đã đạt
164/164 bài test.

GitHub Actions CI được cấu hình trong:

`.github/workflows/ci.yml`


GitHub Actions CI đã chạy thành công trên nhánh `main`.

- Workflow: `Finance Planner CI`
- Commit: `0699eb8`
- Ngày kiểm tra: 27/11/2026
- Kết quả: Success
- Nội dung kiểm tra: ESLint, TypeScript, Vitest và Production Build.

[Xem kết quả GitHub Actions](https://github.com/hoangchau1011/finance-planner/actions)


## 10. Mốc phát triển

| Mốc | Nội dung |
|---|---|
| fp1 | Database, migration, seed, Dashboard |
| fp2 | CRUD giao dịch, validation, URL filters |
| fp3 | Better Auth, session, phân quyền |
| v1.0 | Wishlist, biểu đồ, mở rộng, kiểm thử |

Các tag lịch sử được giữ nguyên, không thay đổi
ngày tạo hoặc nội dung commit cũ.

## 11. Bảo mật

- Dữ liệu tài chính được giới hạn theo userId.
- Các Server Action và Route Handler nghiệp vụ
  kiểm tra session và quyền sở hữu.
- Validation được thực hiện phía server.
- Không đưa database secret ra trình duyệt.
- Guest Demo chỉ sử dụng dữ liệu mô phỏng.
- Mô phỏng tài chính chỉ đọc dữ liệu thật;
  thay đổi kịch bản không tự động ghi vào Neon.

## 12. Giới hạn đã biết

- Mô phỏng tài chính chỉ mang tính ước tính,
  không tính lạm phát, lãi suất và biến động
  thu chi tương lai.
- Giá trị chênh lệch thu trừ chi chỉ là gợi ý,
  không đồng nghĩa với khoản đã tiết kiệm thật.
- Tiến độ Wishlist nâng cao dựa trên savedAmount.
  Cần đối chiếu thêm với công thức dựa trên số dư
  trong yêu cầu gốc của đề bài.
- Dữ liệu Guest Demo không được lưu lâu dài.

## 13. Ảnh minh họa

Ảnh chụp từ ứng dụng thực tế sẽ được bổ sung
trước khi nộp bài:

- Trang chủ
- Dashboard
- Giao dịch
- Báo cáo tài chính
- Ngân sách
- Wishlist
- Mô phỏng tài chính
- Guest Demo
- Kết quả GitHub Actions CI

## 14. Sử dụng AI

Dự án được thực hiện có sự hỗ trợ của AI.

Quá trình sử dụng AI, kiểm chứng kết quả,
những lỗi đã phát hiện và các chỉnh sửa
được ghi trong [AI_LOG.md](./AI_LOG.md).

Quy tắc kỹ thuật và bảo mật được mô tả
trong [AGENTS.md](./AGENTS.md).

Việc sử dụng AI phải được khai báo trung thực
theo yêu cầu môn học PHY10615.
```
