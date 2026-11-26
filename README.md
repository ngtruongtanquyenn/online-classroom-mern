# 🎓 Hệ thống Quản lý Lớp học Trực tuyến (Online Classroom MERN)

## Thành viên nhóm
- **Nguyễn Trường Tấn Quyền** | MSSV: `1822040819`
- **Phạm Ngọc Sang** | MSSV: `1822040884`
- **Nguyễn Tấn Phú** | MSSV: `1822040870`

---

## Mục tiêu & Đối tượng sử dụng

Hệ thống được thiết kế để hướng tới việc số hóa toàn diện quy trình tổ chức và quản lý lớp học trực tuyến, giúp tối ưu hóa việc phân phối học liệu, theo dõi tiến độ học tập, tổ chức kiểm tra và tăng cường tính tương tác minh bạch giữa giảng viên và sinh viên:

- **Admin (Quản trị viên):** Thiết lập và giám sát tổng thể hệ thống, xem biểu đồ phân tích người dùng/danh mục, quản lý tài khoản (khóa/mở khóa, xóa tài khoản kèm dọn dữ liệu), chỉnh sửa/kiểm duyệt/xóa khóa học và hỗ trợ quản lý học viên trong lớp.
- **Teacher (Giảng viên):** Khởi tạo, chỉnh sửa và bật/tắt trạng thái công khai hoặc đặt mã tham gia cho lớp học; đăng tải/chỉnh sửa/xóa tài liệu; tạo bài tập & bài kiểm tra trắc nghiệm có giới hạn thời gian; đăng thông báo thảo luận; chấm điểm bài tập, xem bảng điểm tổng hợp và xuất file `.csv`.
- **Student (Sinh viên):** Tra cứu danh mục khóa học (có phân trang), ghi danh công khai hoặc bằng mã lớp, học liệu video/PDF nhúng trực tiếp, đánh dấu hoàn thành bài học để cập nhật `%` tiến trình, nộp bài tập (có cảnh báo hạn nộp/nộp muộn), làm bài trắc nghiệm tự động chấm điểm, tham gia hỏi đáp và theo dõi thông báo hạn nộp trên thanh điều hướng.

---

## Các chức năng chính

### 1. Xác thực, Phân quyền & Hồ sơ cá nhân
- Đăng ký tài khoản (`Student` hoặc `Teacher`), đăng nhập bảo mật bằng JWT, tự động kiểm tra trạng thái tài khoản (`isActive`).
- Phân quyền truy cập theo 3 vai trò (`admin`, `teacher`, `student`) cả trên giao diện (`ProtectedRoute`) và API (`protect`, `authorize`).
- **Trang Hồ sơ cá nhân (`/profile`):** Cập nhật họ tên, giới thiệu bản thân, tải ảnh đại diện (Cloudinary) và đổi mật khẩu.

### 2. Quản lý Khóa học, Mã lớp & Học liệu
- **Tổ chức khóa học:** Tạo lớp mới, chỉnh sửa thông tin lớp học (tên, danh mục, mô tả, mã tham gia `classCode`), bật/tắt trạng thái **Công khai / Nháp (`isPublished`)** và xóa khóa học (dọn đồng bộ dữ liệu liên quan).
- **Quản lý học liệu (Thêm – Sửa – Xóa):**
  - **Tệp tài liệu (`PDF`, `DOC`, `DOCX`, `ZIP`, `RAR`, `PNG`, `JPG`):** Lưu trữ trên **Cloudinary**, hỗ trợ **xem trước PDF trực tiếp** trong modal.
  - **Video bài giảng:** Hỗ trợ **trình phát YouTube nhúng trực tiếp** ngay trong lớp học.
  - **Bài đọc trực tiếp:** Hiển thị định dạng văn bản gọn gàng.
- **Theo dõi tiến trình:** Sinh viên đánh dấu hoàn thành từng tài liệu; hiển thị badge `Đã hoàn thành` và thanh tiến độ `%` ngay trong trang lớp học.

### 3. Ghi danh, Thảo luận & Thông báo lớp học
- **Ghi danh (Enrollment):** Hỗ trợ lớp mở công khai hoặc lớp riêng tư yêu cầu **Mã tham gia lớp (`classCode`)**; giảng viên/Admin có thể xóa học viên khỏi lớp (tự động dọn bài nộp của học viên đó).
- **Tab Thảo luận & Thông báo:** Giảng viên/Admin đăng thông báo lớp học; sinh viên và giảng viên trao đổi, hỏi đáp trực tiếp dưới từng bài viết.

### 4. Bài tập, Trắc nghiệm (Quiz) & Bảng điểm
- **Bài tập tự luận / đính kèm tệp (Thêm – Sửa – Xóa):** Sinh viên nộp văn bản hoặc tệp lên Cloudinary (chỉ thành viên đã ghi danh mới được nộp; tự động gắn nhãn **Nộp muộn** nếu quá `dueDate`; sinh viên chỉ xem bài nộp của riêng mình). Giảng viên chấm điểm (`0 - 10`) và phản hồi inline.
- **Bài kiểm tra trắc nghiệm (Quiz):** Giảng viên tạo bộ câu hỏi nhiều lựa chọn kèm thời gian làm bài; sinh viên làm bài với đồng hồ đếm ngược, tự động chấm điểm và xem lại đáp án đúng ngay sau khi nộp.
- **Bảng điểm tổng hợp (Gradebook):** Ma trận điểm toàn lớp gồm tiến độ, điểm từng bài tập, từng bài Quiz, điểm trung bình và nút **Xuất bảng điểm (.csv)**.

### 5. Dashboard & Trải nghiệm người dùng
- **Admin Dashboard:** 4 thẻ KPI, **biểu đồ phân bố vai trò người dùng & khóa học theo danh mục**, tìm kiếm và phân trang cho bảng Người dùng & Khóa học, modal chỉnh sửa khóa học.
- **Teacher Dashboard:** Thống kê nhanh, form tạo lớp (có mã lớp & chế độ công khai), sửa nhanh thông tin và bật/tắt trạng thái lớp.
- **Student Dashboard:** Thống kê tiến độ, danh sách **Bài tập sắp đến hạn**, **Bảng điểm bài tập đã chấm** và tiến độ từng lớp; chuông thông báo bài tập chưa nộp trên `Navbar`.
- **Toast & Confirm Modal:** Thay thế toàn bộ `alert()`/`window.confirm()` mặc định bằng hệ thống thông báo toast và hộp thoại xác nhận đồng bộ giao diện.

---

## Công nghệ sử dụng

| Thành phần | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, React Router v7 | Xây dựng ứng dụng web đơn trang (SPA) tốc độ cao |
| **Styling & UI** | Tailwind CSS v4, Lucide React | Giao diện hiện đại, responsive, toast/modal & icon đồng bộ |
| **Giao tiếp API** | Axios | Gửi request HTTP bất đồng bộ và tự động gắn JWT Token |
| **Backend** | Node.js, Express.js v5 | Xây dựng hệ thống RESTful API theo kiến trúc MVC |
| **Xác thực & Bảo mật** | JWT (`jsonwebtoken`), `bcryptjs` | Quản lý phiên đăng nhập, phân quyền RBAC và băm mật khẩu |
| **Upload & Lưu trữ tệp** | Multer, Cloudinary (`multer-storage-cloudinary`) | Lưu trữ ảnh đại diện, tài liệu học tập và bài nộp trên Cloudinary |
| **Cơ sở dữ liệu** | MongoDB Atlas, Mongoose | Lưu trữ đám mây với các mô hình `User`, `Course`, `Enrollment`, `Assignment`, `Quiz`, `Announcement` |

---

## Các nhóm REST API chính

| Nhóm | Tiền tố Route | Endpoints tiêu biểu |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `PUT /profile`, `PUT /password` |
| **Courses** | `/api/courses` | `GET /`, `GET /my-courses`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/materials`, `PUT /:id/materials/:materialId`, `DELETE /:id/materials/:materialId` |
| **Enrollments** | `/api/enrollments` | `GET /my-enrollments`, `GET /course/:courseId/my-enrollment`, `POST /:courseId`, `PUT /:courseId/complete-material/:materialId`, `GET /course/:courseId/students`, `DELETE /:enrollmentId` |
| **Assignments** | `/api/assignments` | `GET /my-upcoming`, `POST /`, `GET /course/:courseId`, `PUT /:id`, `DELETE /:id`, `POST /:id/submit`, `PUT /:id/grade/:submissionId` |
| **Quizzes** | `/api/quizzes` | `GET /course/:courseId`, `POST /`, `POST /:id/submit`, `DELETE /:id` |
| **Announcements** | `/api/announcements` | `GET /course/:courseId`, `POST /course/:courseId`, `POST /:id/comments`, `DELETE /:id` |
| **Admin** | `/api/admin` | `GET /stats`, `GET /users`, `PUT /users/:id/toggle-status`, `DELETE /users/:id`, `GET /courses` |

---

## Hướng dẫn cài đặt & khởi chạy

### Yêu cầu môi trường
- **Node.js** phiên bản `v18.x` trở lên (khuyên dùng Node `20+`).
- Trình quản lý gói **npm** và **Git**.
- Tài khoản **MongoDB Atlas** và **Cloudinary**.

### 1. Clone mã nguồn dự án
```bash
git clone https://github.com/ngtruongtanquyenn/online-classroom-mern.git
cd online-classroom-mern
```

### 2. Cài đặt thư viện
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` bên trong thư mục `server/` (tham khảo `server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.hfa97fo.mongodb.net/online_classroom?retryWrites=true&w=majority
JWT_SECRET=thay_bang_chuoi_bi_mat_ngau_nhien
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. (Tùy chọn) Tạo tài khoản Admin khởi tạo
```bash
node server/seed.js
```
> Script `seed.js` sẽ tạo tài khoản `admin@classroom.com` với mật khẩu `password123`.

### 5. Khởi chạy dự án
Mở 2 cửa sổ Terminal riêng biệt để chạy đồng thời Backend và Frontend:

**Terminal 1 – Khởi chạy Backend (`server`):**
```bash
cd server
npm run dev
```

**Terminal 2 – Khởi chạy Frontend (`client`):**
```bash
cd client
npm run dev
```

Sau khi khởi chạy thành công:
- **Giao diện web (Frontend):** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`

---

## Cấu trúc thư mục

```text
online-classroom-mern/
├── client/                         # Mã nguồn giao diện người dùng (React + Vite)
│   ├── public/                     # Tài nguyên tĩnh (favicon, icon)
│   ├── src/
│   │   ├── api/                    # Cấu hình Axios client & interceptor gắn JWT
│   │   ├── components/             # Navbar, ProtectedRoute, Quiz/Discussion/Gradebook Tabs
│   │   ├── context/                # AuthContext, ToastContext (Toast & Confirm Modal)
│   │   ├── pages/                  # Home, Login, Register, Profile, CourseDetail, các Dashboard
│   │   ├── App.jsx                 # Khai báo routing & layout chính
│   │   ├── index.css               # Cấu hình Tailwind CSS & typography
│   │   └── main.jsx                # Điểm mount ứng dụng React
│   ├── index.html                  # Trang HTML gốc
│   ├── vite.config.js              # Cấu hình Vite & Tailwind plugin
│   └── package.json                # Danh sách thư viện Frontend
│
├── server/                         # Mã nguồn Backend API (Node.js + Express)
│   ├── config/                     # Cấu hình kết nối MongoDB Atlas (db.js)
│   ├── controllers/                # Xử lý logic (auth, course, enrollment, assignment, quiz, announcement, admin)
│   ├── middlewares/                # Xác thực JWT, phân quyền, xử lý lỗi & upload Cloudinary
│   ├── models/                     # Mongoose Schema (User, Course, Assignment, Enrollment, Quiz, Announcement)
│   ├── routes/                     # Định nghĩa các tuyến đường REST API
│   ├── uploads/                    # Thư mục dự phòng file tĩnh local
│   ├── .env.example                # Mẫu cấu hình biến môi trường
│   ├── seed.js                     # Kịch bản tạo tài khoản Admin mẫu
│   ├── server.js                   # Điểm khởi chạy chính của Express server
│   └── package.json                # Danh sách thư viện Backend
│
├── .gitignore                      # Danh sách tệp/thư mục loại trừ khỏi Git
├── package.json                    # Thư viện dùng chung (cloudinary, multer-storage-cloudinary)
└── README.md                       # Tài liệu tổng quan và hướng dẫn dự án
```

---

## Phân quyền & Bảo mật
- **Xác thực phiên làm việc:** Sử dụng JWT (`JSON Web Token`) đính kèm trong Header `Authorization: Bearer <token>`.
- **Phân quyền theo vai trò (RBAC):**
  - `admin`: Toàn quyền quản trị hệ thống, quản lý người dùng, chỉnh sửa/kiểm duyệt khóa học và hỗ trợ quản lý lớp.
  - `teacher`: Quản lý khóa học do mình tạo (học liệu, bài tập, trắc nghiệm, thông báo, xóa học viên và chấm điểm).
  - `student`: Ghi danh khóa học, học tập, làm bài tập/trắc nghiệm và theo dõi tiến độ/điểm số cá nhân.
- **Bảo mật dữ liệu nhạy cảm:** Mật khẩu băm một chiều bằng `bcryptjs`; bài nộp của sinh viên được lọc riêng theo người dùng khi gọi API; thông tin kết nối DB và API key được cô lập trong `server/.env`.

---

## Tài khoản kiểm thử (Demo Accounts)

*(Dữ liệu kiểm thử phục vụ demo theo từng vai trò trên hệ thống)*

| Vai trò (Role) | Email đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@classroom.com` | `123456789` *(hoặc `password123` nếu chạy lại `server/seed.js`)* |
| **Teacher** | `teacher@classroom.com` | `123456789` |
| **Student** | `student@classroom.com` | `123456789` |

---

## Đóng góp & Bản quyền

Dự án được xây dựng và hoàn thiện bởi các thành viên trong nhóm:
- **Nguyễn Trường Tấn Quyền**
- **Phạm Ngọc Sang**
- **Nguyễn Tấn Phú**

Dự án được định hướng và hoàn thiện dựa trên các ý kiến đóng góp, nhận xét từ **Giảng viên hướng dẫn (GVHD)**.
