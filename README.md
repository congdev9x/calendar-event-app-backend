## 🗖 Calendar Event App – Backend

API backend cho ứng dụng quản lý sự kiện theo lịch Dương và Âm lịch, hỗ trợ người dùng cá nhân hóa và đồng bộ hóa với Google Calendar.

---

### 🛠 Công nghệ sử dụng

* **Node.js** + **Express**
* **Prisma** + **PostgreSQL**
* **TypeScript**
* **JWT** Auth
* **Google OAuth 2.0**
* **Zodios** API schema

---

### ✨ Hướng dẫn khởi chạy

#### 1. Cài đặt

```bash
npm install
```

#### 2. Cấu hình

Tạo file `.env` và thêm:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/calendar_db
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

#### 3. Khởi tạo database

```bash
npx prisma migrate dev
npx prisma generate
```

#### 4. Chạy server dev

```bash
npm run dev
```

#### 5. Build + start production

```bash
npm run build
npm start
```

---

### ✅ Đã triển khai

* [x] Đăng ký, đăng nhập (email + password)
* [x] Đăng nhập bằng Google OAuth
* [x] Sinh JWT token, xác thực middleware
* [x] Quản lý User / Event liên kết qua userId
* [x] API tạo/sửa/xoá/lấy sự kiện cá nhân
* [x] Chặn sửa/xoá event của người khác
* [x] Lưu accessToken + refreshToken từ Google
* [x] Đồng bộ tạo/sửa/xoá sự kiện với Google Calendar
* [x] Tự động refresh access token khi hết hạn

---

### 🧍 Chưa triển khai

* [ ] Webhook để đồng bộ ngược từ Google Calendar về app
* [ ] Nhắc lịch (notification hoặc email trước sự kiện)
* [ ] Tùy chọn chia sẻ lịch với người khác
* [ ] Dashboard admin (thống kê, theo dõi user)
* [ ] Tự chọn timezone + cấu hình giờ nhắc
* [ ] Lịch công việc nhóm (đa người dùng)
* [ ] Rate limit, audit log cho request

---

### 📁 Cấu trúc thư mục

```
src/
├── app.ts               # Entrypoint chính
├── routes/              # Các router Express
├── controllers/         # Xử lý request
├── middlewares/         # Auth, error handling
├── lib/                 # Prisma, JWT, utils
├── services/            # Google Calendar, email...
└── config/              # Passport config
```
