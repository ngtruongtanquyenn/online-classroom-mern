 🎓 Hệ thống Quản lý Lớp học Trực tuyến (Online Classroom MERN)

## Thành viên nhóm
- Nguyễn Trường Tấn Quyền | MSSV: 1822040819
- Phạm Ngọc Sang | MSSV: 1822040884
- Nguyễn Tấn Phú | MSSV: 1822040870

---

## Mục tiêu & Đối tượng sử dụng

Hệ thống được thiết kế để hướng tới việc số hóa toàn diện quy trình tổ chức và quản lý lớp học trực tuyến, giúp tối ưu hóa việc phân phối học liệu, theo dõi tiến độ học tập và tăng cường tính tương tác minh bạch giữa giảng viên và sinh viên:

- **Admin (Quản trị viên):** Thiết lập và giám sát tổng thể hệ thống, quản lý danh sách tài khoản người dùng, phân quyền vai trò (`Admin`, `Teacher`, `Student`), kiểm duyệt khóa học và theo dõi thống kê hoạt động toàn hệ thống.
- **Teacher (Giảng viên):** Khởi tạo và quản lý nội dung các khóa học phụ trách, đăng tải tài liệu/bài giảng, tạo bài tập và kiểm tra trực tuyến, theo dõi danh sách sinh viên ghi danh, chấm điểm và phản hồi bài nộp.
- **Student (Sinh viên):** Tra cứu danh mục khóa học, đăng ký ghi danh tham gia lớp học, tiếp cận tài liệu học tập, thực hiện nộp bài tập trực tuyến và theo dõi điểm số, tiến độ hoàn thành khóa học của cá nhân.

---

## Các chức năng chính

### 1. Quản lý xác thực & Phân quyền người dùng
- Đăng ký tài khoản mới, đăng nhập bảo mật và quản lý thông tin hồ sơ cá nhân.
- Phân quyền truy cập chặt chẽ theo 3 vai trò (`Admin`, `Teacher`, `Student`): tự động điều hướng giao diện và giới hạn quyền gọi API tương ứng với từng nhóm đối tượng.
- Vô hiệu hóa quyền tự đăng ký tài khoản `Admin` trên giao diện công khai để đảm bảo an toàn bảo mật hệ thống.

### 2. Quản lý khóa học & Học liệu
- **Tổ chức khóa học:** Cho phép giảng viên tạo mới, cập nhật thông tin chi tiết, mô tả, lộ trình và trạng thái hoạt động của từng khóa học.
- **Quản lý nội dung & tệp đính kèm:** Hỗ trợ tải lên, lưu trữ và phân phối tài liệu bài giảng, slide, tệp tham khảo phục vụ quá trình học tập của sinh viên.
- **Tra cứu & lọc khóa học:** Hỗ trợ tìm kiếm nhanh khóa học theo tên, giảng viên phụ trách hoặc danh mục môn học.

### 3. Quản lý ghi danh & Lớp học (Enrollment)
- Sinh viên chủ động đăng ký tham gia các khóa học mở trên hệ thống.
- Giảng viên theo dõi danh sách sinh viên đã ghi danh trong từng lớp, quản lý sĩ số và trạng thái tham gia học tập của từng học viên.

### 4. Giao bài tập, Nộp bài & Chấm điểm (Assignment & Submission)
- **Tạo bài tập:** Giảng viên thiết lập tiêu đề, yêu cầu chi tiết, tài liệu đính kèm và hạn chót nộp bài (`deadline`) cho từng bài tập trong khóa học.
- **Nộp bài trực tuyến:** Sinh viên nộp bài làm (văn bản hoặc tệp đính kèm) trực tiếp trên hệ thống trước thời hạn quy định và theo dõi trạng thái bài nộp.
- **Chấm điểm & Phản hồi:** Giảng viên xem bài làm của từng sinh viên, nhập điểm số và gửi nhận xét đánh giá chi tiết; điểm số được cập nhật trực tiếp về trang cá nhân của sinh viên.

### 5. Bảng điều khiển (Dashboard) & Thống kê tổng quan
- **Admin Dashboard:** Tổng hợp trực quan số lượng người dùng theo từng vai trò, tổng số khóa học, lượt ghi danh và tình trạng hoạt động chung của hệ thống.
- **Teacher & Student Dashboard:** Hiển thị danh sách khóa học đang giảng dạy hoặc đang theo học, nhắc nhở các bài tập sắp đến hạn và thống kê tiến độ học tập.

---

## Công nghệ sử dụng

| Thành phần | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, React Router | Xây dựng giao diện ứng dụng web đơn trang (SPA) tốc độ cao |
| **Giao tiếp API** | Axios | Gửi yêu cầu HTTP bất đồng bộ và đính kèm JWT Token tự động |
| **Styling & UI** | CSS / Tailwind CSS | Thiết kế bố cục đáp ứng (Responsive), bảng biểu và biểu mẫu nhập liệu |
| **Backend** | Node.js, Express.js | Xây dựng hệ thống RESTful API theo kiến trúc phân tầng MVC |
| **Xác thực & Bảo mật** | JWT (JSON Web Token), Bcrypt | Quản lý phiên đăng nhập, phân quyền và mã hóa mật khẩu một chiều |
| **Xử lý tệp tin** | Multer | Tiếp nhận và lưu trữ tài liệu bài giảng, tệp bài tập tải lên máy chủ |
| **Cơ sở dữ liệu** | MongoDB Atlas, Mongoose | Lưu trữ dữ liệu đám mây và mô hình hóa dữ liệu hướng đối tượng |

---

## Hướng dẫn cài đặt & khởi chạy

### Yêu cầu môi trường
- **Node.js** phiên bản v18.x trở lên (khuyên dùng Node 20+).
- Trình quản lý gói **npm** và **Git**.

### 1. Clone mã nguồn dự án
```bash
git clone [https://github.com/ngtruongtanquyenn/online-classroom-mern.git](https://github.com/ngtruongtanquyenn/online-classroom-mern.git)
cd online-classroom-mern
2. Cài đặt thư viện
Cài đặt các gói phụ thuộc cho cả hai thư mục server và client:Bashnpm --prefix server install
npm --prefix client install
3. Cấu hình biến môi trường
Tạo file .env bên trong thư mục server/ (dựa trên file mẫu server/.env.example) với nội dung sau:Đoạn mãPORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.hfa97fo.mongodb.net/online_classroom?retryWrites=true&w=majority
JWT_SECRET=thay_bang_chuoi_bi_mat_ngau_nhien
JWT_EXPIRE=7d
4. Khởi chạy dự án
Mở 2 cửa sổ Terminal riêng biệt tại thư mục gốc dự án để chạy đồng thời Backend và Frontend:Terminal 1 – Khởi chạy Backend (server):Bashcd server
npm run dev
Terminal 2 – Khởi chạy Frontend (client):Bashcd client
npm run dev
Sau khi khởi chạy thành công:Giao diện web (Frontend): http://localhost:5173Backend API: http://localhost:5000/apiCấu trúc thư mụcPlaintextonline-classroom-mern/
├── client/                      # Mã nguồn giao diện người dùng (React + Vite)
│   ├── public/                  # Tài nguyên tĩnh (hình ảnh, icon)
│   ├── src/                     # Thành phần giao diện, trang chức năng và gọi API
│   ├── index.html               # Trang HTML gốc của ứng dụng
│   ├── vite.config.js           # Cấu hình bundler Vite
│   └── package.json             # Danh sách thư viện Frontend
│
├── server/                      # Mã nguồn Backend API (Node.js + Express)
│   ├── config/                  # Cấu hình kết nối cơ sở dữ liệu MongoDB Atlas
│   ├── controllers/             # Tiếp nhận request và xử lý logic nghiệp vụ
│   ├── middlewares/             # Xác thực JWT, kiểm tra phân quyền và upload file
│   ├── models/                  # Định nghĩa Mongoose Schema (User, Course, Assignment, Enrollment)
│   ├── routes/                  # Khai báo các tuyến đường REST API
│   ├── uploads/                 # Thư mục lưu trữ tệp tài liệu và bài nộp tải lên
│   ├── .env.example             # Mẫu cấu hình biến môi trường
│   ├── seed.js                  # Kịch bản nạp dữ liệu khởi tạo mẫu
│   ├── server.js                # Điểm khởi chạy chính của máy chủ Express
│   └── package.json             # Danh sách thư viện Backend
│
├── .gitignore                   # Danh sách tệp/thư mục loại trừ khỏi Git
└── README.md                    # Tài liệu tổng quan và hướng dẫn dự án
Phân quyền & Bảo mật
Xác thực phiên làm việc: Sử dụng JWT (JSON Web Token) đính kèm trong Header mỗi yêu cầu để xác minh danh tính người dùng.
Phân quyền theo vai trò (RBAC):
admin: Toàn quyền quản trị hệ thống, quản lý tài khoản người dùng và kiểm duyệt nội dung.
teacher: Quản lý khóa học do mình tạo, đăng tải học liệu, giao bài tập và chấm điểm học viên.
student: Chỉ có quyền xem thông tin khóa học, đăng ký học và thao tác trên bài nộp/dữ liệu của chính mình.
Bảo mật dữ liệu nhạy cảm: Mật khẩu người dùng được băm một chiều bằng thuật toán Bcrypt trước khi lưu vào MongoDB Atlas; thông tin kết nối cơ sở dữ liệu được cô lập trong file server/.env (đã loại trừ khỏi Git qua .gitignore).
Tài khoản kiểm thử (Demo Accounts)
(Dữ liệu đã được đồng bộ sẵn trên MongoDB Atlas để phục vụ kiểm thử các vai trò)
Vai trò (Role)          Email đăng nhập         Mật khẩu
Admin                   admin@gmail.com         123456789
Teacher                 teacher@gmail.com       123456789
Student                 student@gmail.com       123456789
Đóng góp & Bản quyền
Dự án được xây dựng và hoàn thiện bởi các thành viên trong nhóm:
Nguyễn Trường Tấn Quyền
Phạm Ngọc Sang
Nguyễn Tấn Phú
Dự án được định hướng và hoàn thiện dựa trên các ý kiến đóng góp, nhận xét từ Giảng viên hướng dẫn (GVHD).
---

