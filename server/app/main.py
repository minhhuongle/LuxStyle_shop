"""
LuxeStyle E-Commerce FastAPI Application
Full-stack Fashion & Accessories Platform
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.api import api_router

# Ensure all models are loaded for table metadata creation
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Tự động khởi tạo cấu trúc bảng SQLite nếu chưa tồn tại
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic nếu cần


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    Hệ sinh thái API Thương mại điện tử Thời trang & Phụ kiện cao cấp LuxeStyle.
    
    ### Tính năng chính:
    * **Auth & Authorization:** Đăng ký, đăng nhập JWT Bearer token kèm phân quyền Customer & Admin.
    * **Sản phẩm & Danh mục:** Tìm kiếm từ khóa, lọc theo danh mục, khoảng giá, phân trang chuyên nghiệp.
    * **Đơn hàng & Giỏ hàng:** Tính tiền tự động từ Database, trừ tồn kho an toàn và tra cứu lịch sử đơn hàng.
    * **Admin Dashboard:** CRUD Sản phẩm, Quản lý trạng thái đơn hàng và Thống kê doanh thu/khách hàng.
    * **AI Sales Advisor:** Trợ lý tư vấn bán hàng thời trang thông minh tích hợp Google Gemini API.
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Cấu hình CORS đầy đủ cho React Frontend (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hỗ trợ cả hai tiền tố đường dẫn: /api và /api/v1
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "products": "/api/products",
            "orders": "/api/orders",
            "admin": "/api/admin",
            "chat": "/api/chat"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
