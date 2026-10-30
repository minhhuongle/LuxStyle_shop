# 👗 LuxeStyle - Full-stack E-Commerce Platform (Thời trang & Phụ kiện)

> Áp dụng phương pháp **Vibe Coding** với kiến trúc **Clean Architecture** phân tách Client / Server độc lập, hiệu năng cao và chuẩn mực enterprise.

---

## 🏗️ Tổng Quan Tech Stack

| Thành phần | Công nghệ sử dụng |
|---|---|
| **Backend** | Python 3.13, FastAPI, SQLite, SQLAlchemy ORM, Pydantic v2, Bcrypt, PyJWT, Google GenAI SDK |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide-react, Axios, React Router v6 |
| **Database** | SQLite (`ecommerce.db`) với quan hệ 1-N, N-N, cascade delete và transaction safety |
| **AI Sales Advisor**| Google Gemini API (`google-genai` SDK) với System Prompt nạp kho thời trang thực tế và fallback engine |
| **API Format** | RESTful JSON, Swagger OpenAPI 3.1, JWT Bearer Token |

---

## 📁 Cấu Trúc Toàn Dự Án (Clean Architecture)

```
Final_Test Vibe_Code/
├── server/                      # BACKEND (FastAPI + SQLAlchemy + SQLite + Gemini)
│   ├── app/
│   │   ├── main.py              # Điểm khởi chạy FastAPI, CORS, Router mounting (/api & /api/v1)
│   │   ├── core/                # Core configs: database.py, security.py (Bcrypt/JWT), config.py
│   │   ├── models/              # SQLAlchemy Database Models (User, Category, Product, Order, OrderItem)
│   │   ├── schemas/             # Pydantic Schemas (Product, Order, User, Analytics, Chat)
│   │   ├── services/            # chat_service.py (Google Gemini AI + Heuristic Fallback)
│   │   └── api/                 # Endpoints: auth, products, orders, admin, chat
│   ├── scripts/
│   │   ├── seed_data.py         # Script tự động tạo Admin, User mẫu & 12 sản phẩm thời trang
│   │   └── test_api.py          # Script kiểm thử tự động 10/10 kịch bản API
│   ├── .env                     # File biến môi trường (JWT secret, Gemini API key, CORS)
│   ├── ecommerce.db             # CSDL SQLite lưu trữ dữ liệu
│   └── requirements.txt         # Thư viện Python
│
├── client/                      # FRONTEND (React + Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── App.tsx              # Component tổng quan LuxeStyle
│   │   ├── main.tsx             # React DOM root
│   │   └── index.css            # Tailwind CSS & Typography
│   ├── public/                  # Tài nguyên tĩnh
│   ├── package.json             # Cấu hình npm & dependencies
│   ├── vite.config.ts           # Cấu hình Vite & reverse proxy tới :8000
│   └── tailwind.config.js       # Palette màu thời trang sang trọng (Gold, Champagne, Charcoal)
│
└── README.md                    # Tài liệu hướng dẫn toàn diện
```

---

## ⚡ Hướng Dẫn Khởi Chạy Nhanh

### 1. Khởi chạy Backend (Terminal 1)
```powershell
cd "d:\Final_Test Vibe_Code\server"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: **http://127.0.0.1:8000/docs**
- Chạy kiểm thử tự động: `python scripts/test_api.py`

### 2. Khởi chạy Frontend (Terminal 2)
```powershell
cd "d:\Final_Test Vibe_Code\client"
npm run dev
```
- Web Application: **http://localhost:5173**

---

## 🔐 Thông Tin Đăng Nhập Mẫu

- **Tài khoản Quản Trị Viên (Admin):** `admin@store.com` / `admin123` (Role: `admin`)
- **Tài khoản Khách Hàng (Customer):** `customer@store.com` / `customer123` (Role: `customer`)
