# 🛍️ LuxeStyle Fashion & Accessories - Backend API

FastAPI backend built with Python 3, SQLite (SQLAlchemy ORM), Pydantic v2, and JWT Authentication, following Clean Architecture principles.

---

## 🏛️ Clean Architecture Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI App Entrypoint, CORS, Dual Prefix (/api & /api/v1)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic Settings (DB, JWT, Gemini, CORS)
│   │   ├── database.py          # SQLite Engine, SessionLocal, Base & get_db
│   │   └── security.py          # Bcrypt Password Hashing & JWT Token Generation
│   ├── models/                  # SQLAlchemy ORM Models (Entities)
│   │   ├── __init__.py
│   │   ├── user.py              # users table (id, username, email, hashed_password, role, created_at)
│   │   ├── category.py          # categories table (id, name, slug)
│   │   ├── product.py           # products table (id, name, description, price, stock, category_id, image_url, created_at)
│   │   ├── order.py             # orders table (id, user_id, total_price, status, created_at)
│   │   └── order_item.py        # order_items table (id, order_id, product_id, quantity, price)
│   ├── schemas/                 # Pydantic DTOs & Request/Response Validation
│   │   ├── __init__.py
│   │   ├── user.py              # UserCreate, UserLogin, UserResponse, Token
│   │   ├── category.py          # CategoryCreate, CategoryResponse
│   │   ├── product.py           # ProductCreate, ProductUpdate, ProductResponse, PaginatedProductResponse
│   │   ├── order.py             # OrderCreate, OrderUpdateStatus, OrderResponse, PaginatedOrderResponse
│   │   ├── analytics.py         # AnalyticsOverviewResponse
│   │   └── chat.py              # ChatRequest, ChatResponse, ChatMessage
│   ├── services/
│   │   ├── __init__.py
│   │   └── chat_service.py      # Google Gemini AI Integration & Heuristic Fallback Engine
│   └── api/
│       ├── __init__.py
│       ├── deps.py              # get_current_user & require_admin dependencies
│       └── v1/
│           ├── __init__.py
│           ├── api.py           # Router Aggregator
│           └── endpoints/       # Route Controllers
│               ├── __init__.py
│               ├── auth.py      # /api/auth (register, login, me)
│               ├── categories.py# /api/categories (list, get, create)
│               ├── products.py  # /api/products (list, filter, get by id)
│               ├── orders.py    # /api/orders (create, my-orders, get by id)
│               ├── admin.py     # /api/admin (CRUD products, orders, analytics)
│               └── chat.py      # /api/chat (AI Sales Chatbot Advisor)
├── scripts/
│   ├── __init__.py
│   ├── seed_data.py             # Database Initial Seeding Script
│   └── test_api.py              # Automated 10-point Test Suite
├── .env                         # Active Environment Variables
├── .env.example                 # Example Environment Variables
├── ecommerce.db                 # SQLite Database File
└── requirements.txt             # Python Backend Dependencies
```

---

## 📡 Danh Sách Toàn Bộ RESTful API Endpoints

### 1. Xác thực & Phân quyền (Auth & Authorization)
| Phương thức | Đường dẫn | Phân quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản khách hàng mới (`customer`) |
| `POST` | `/api/auth/login` | Public | Đăng nhập nhận JWT Token (payload chứa `sub` và `role`) |
| `GET` | `/api/auth/me` | Bearer Token | Lấy thông tin cá nhân của người dùng đang đăng nhập |

### 2. Dành cho Khách hàng (Client Endpoints)
| Phương thức | Đường dẫn | Phân quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/products` | Public | Danh sách sản phẩm có phân trang (`page`, `page_size`), tìm kiếm (`keyword`), lọc danh mục (`category_id`), lọc giá (`min_price`, `max_price`) |
| `GET` | `/api/products/{id}` | Public | Xem chi tiết sản phẩm kèm thông tin danh mục |
| `POST` | `/api/orders` | Customer / Admin | Tạo đơn hàng mới từ giỏ hàng (tự động tính tổng tiền từ DB, trừ stock, tạo order_items) |
| `GET` | `/api/orders/my-orders` | Customer / Admin | Xem lịch sử đơn hàng của người dùng hiện tại |
| `GET` | `/api/orders/{id}` | Owner / Admin | Xem chi tiết một đơn hàng cụ thể |

### 3. Dành cho Quản trị viên (Admin Dashboard - Yêu cầu role: `admin`)
| Phương thức | Đường dẫn | Phân quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/admin/products` | Admin | Tạo sản phẩm mới trong kho |
| `PUT` | `/api/admin/products/{id}` | Admin | Cập nhật thông tin sản phẩm theo ID |
| `DELETE` | `/api/admin/products/{id}` | Admin | Xóa sản phẩm khỏi kho hàng |
| `GET` | `/api/admin/orders` | Admin | Lấy danh sách tất cả đơn hàng (phân trang, lọc status) |
| `PUT` | `/api/admin/orders/{id}/status`| Admin | Cập nhật trạng thái đơn hàng (`pending`, `shipping`, `completed`, `cancelled`) |
| `GET` | `/api/admin/analytics/overview`| Admin | Báo cáo doanh thu, tổng đơn hàng, tổng khách hàng, tổng sản phẩm |

### 4. AI Chatbot Tư vấn bán hàng (Google Gemini)
| Phương thức | Đường dẫn | Phân quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/chat` | Public | Trợ lý tư vấn bán hàng thông minh (nạp sản phẩm kho thực tế, xử lý an toàn khi thiếu key hoặc lỗi API) |

---

## 🔑 Tài Khoản Mẫu Đã Seed

| Vai trò | Email | Mật khẩu | Phân quyền |
|---|---|---|---|
| **Admin** | `admin@store.com` | `admin123` | Quản trị viên (`admin`) |
| **Customer** | `customer@store.com` | `customer123` | Khách hàng (`customer`) |

---

## 🚀 Lệnh Khởi Chạy & Kiểm Thử

### 1. Kích hoạt môi trường và chạy Backend:
```powershell
cd "d:\Final_Test Vibe_Code\server"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Chạy bộ kiểm thử tự động toàn bộ 10 kịch bản:
```powershell
python scripts/test_api.py
```

### 3. Trải nghiệm Swagger UI:
Mở trình duyệt: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**
