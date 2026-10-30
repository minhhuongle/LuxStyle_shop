# LuxeStyle Frontend (React Vite + TypeScript + Tailwind CSS)

Hệ thống giao diện thương mại điện tử Thời trang & Phụ kiện cao cấp **LuxeStyle**, thiết kế theo phong cách tối giản và thanh lịch (Minimalist Luxury / Haute Couture).

---

## 🌟 Kiến Trúc & Công Nghệ

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (Dark Luxury Palette: `#0d0e12`, Champagne & Gold `#D4AF37`)
- **Typography:** Playfair Display (Serif) & Inter (Sans-serif)
- **Icons:** `lucide-react`
- **Routing:** `react-router-dom` v6
- **HTTP Client:** `axios` (với Interceptors tự động đính kèm `Bearer token`)
- **State Management:** React Context API (`AuthContext`, `CartContext`, `ToastContext`)

---

## 📂 Cấu Trúc Thư Mục `src/`

```
src/
├── types/
│   └── index.ts                 # Toàn bộ TypeScript types & interfaces
├── services/
│   └── api.ts                   # Axios client + Interceptors + Service APIs (Auth, Categories, Products, Orders, Admin, Chat)
├── context/
│   ├── AuthContext.tsx          # Quản lý phiên đăng nhập, JWT token, user profile, phân quyền
│   ├── CartContext.tsx          # Quản lý giỏ hàng: thêm, bớt, xóa, tính tổng tiền, lưu LocalStorage
│   └── ToastContext.tsx         # Hệ thống thông báo glassmorphic đẹp mắt
├── utils/
│   └── formatters.ts            # Định dạng tiền tệ VND, thời gian, trạng thái đơn hàng
├── components/
│   ├── common/
│   │   ├── Badge.tsx            # Badge trạng thái đơn hàng (Đang xử lý, Đang giao, Đã hoàn thành, Đã hủy)
│   │   └── ProductCard.tsx      # Thẻ sản phẩm cao cấp, hiệu ứng hover, nút thêm nhanh giỏ hàng
│   ├── layout/
│   │   ├── Header.tsx           # Logo, ô tìm kiếm nhanh, icon Giỏ hàng (badge số lượng), menu Tài khoản/Đăng nhập
│   │   ├── Footer.tsx           # 4 trụ cột cam kết chính hãng, danh mục, liên kết hỗ trợ
│   │   ├── UserLayout.tsx       # Khung giao diện khách hàng + Floating AI Chatbot
│   │   └── AdminLayout.tsx      # Khung trang quản trị (Protected Route + Sidebar + Breadcrumb)
│   └── chat/
│       └── ChatbotWidget.tsx    # Nút tròn nổi (FAB) + Hộp thoại AI Stylist trực tiếp qua API POST /api/chat
├── pages/
│   ├── HomePage.tsx             # Trang chủ: Hero banner, bộ lọc danh mục, thanh trượt giá, lưới sản phẩm, phân trang
│   ├── ProductDetailPage.tsx    # Chi tiết sản phẩm: Ảnh lớn, mô tả, giá VND, số lượng kho, nút Thêm giỏ & Mua ngay
│   ├── CartPage.tsx             # Xem giỏ hàng, cập nhật số lượng, áp dụng mã ưu đãi, tóm tắt đơn hàng
│   ├── CheckoutPage.tsx         # Form địa chỉ nhận hàng, phương thức thanh toán COD/VietQR/MoMo, nút Đặt hàng
│   ├── OrdersPage.tsx           # Lịch sử đơn hàng, xem chi tiết sản phẩm đã mua và trạng thái giao hàng
│   ├── AuthPage.tsx             # Đăng nhập / Đăng ký (kèm nút điền nhanh 1-click Admin & Khách hàng)
│   ├── NotFoundPage.tsx         # Trang lỗi 404
│   └── admin/
│       ├── AdminOverviewPage.tsx # Thống kê Doanh thu, Đơn hàng, Khách hàng, Sản phẩm & biểu đồ trạng thái
│       ├── AdminProductsPage.tsx # Bảng sản phẩm, Modal Thêm/Sửa sản phẩm, Modal Xóa an toàn
│       └── AdminOrdersPage.tsx   # Danh sách đơn hàng, Dropdown đổi trạng thái trực tiếp (Pending/Shipping/Completed/Cancelled)
├── App.tsx                      # Cấu hình Routing & Context Providers
├── main.tsx                     # Entry point
└── index.css                    # Tailwind directives, custom scrollbar & animations
```

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Cài đặt thư viện (nếu chưa cài):
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev server):
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5173/` (tự động proxy API sang `http://127.0.0.1:8000/api`).

### 3. Build kiểm tra sản phẩm:
```bash
npm run build
```

---

## 🔑 Tài Khoản Trải Nghiệm Mẫu

Tại trang Đăng nhập (`/login`), có sẵn 2 nút chọn nhanh:
- **Quản Trị Viên (Admin):** `admin@store.com` / `admin123` (Toàn quyền vào `/admin`)
- **Khách Hàng (User):** `customer@store.com` / `customer123`
