"""
Admin Dashboard Endpoints (Requires Admin role):
- Product CRUD: POST /api/admin/products, PUT /api/admin/products/{id}, DELETE /api/admin/products/{id}
- Order Management: GET /api/admin/orders, PUT /api/admin/orders/{id}/status
- Analytics Overview: GET /api/admin/analytics/overview
"""

import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.order import OrderResponse, OrderUpdateStatus, PaginatedOrderResponse
from app.schemas.analytics import AnalyticsOverviewResponse
from app.api.deps import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


# ==========================================
# 1. CRUD SẢN PHẨM (ADMIN)
# ==========================================

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def admin_create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin] Thêm sản phẩm mới vào kho hàng:
    - Kiểm tra danh mục hợp lệ nếu category_id được chỉ định.
    - Lưu thông tin và trả về sản phẩm vừa tạo.
    """
    if product_in.category_id is not None:
        cat = db.query(Category).filter(Category.id == product_in.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Danh mục với ID {product_in.category_id} không tồn tại."
            )

    new_product = Product(**product_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.put("/products/{id}", response_model=ProductResponse)
def admin_update_product(
    id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin] Cập nhật thông tin sản phẩm theo ID:
    - Cho phép cập nhật linh hoạt từng trường hoặc toàn bộ (name, description, price, stock, category_id, image_url).
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm với ID {id} để cập nhật."
        )

    update_data = product_update.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Danh mục với ID {update_data['category_id']} không tồn tại."
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{id}", status_code=status.HTTP_200_OK)
def admin_delete_product(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin] Xóa sản phẩm khỏi kho hàng:
    - Trả về thông báo xác nhận xóa thành công.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm với ID {id} để xóa."
        )

    product_name = product.name
    db.delete(product)
    db.commit()
    return {
        "success": True,
        "message": f"Đã xóa thành công sản phẩm '{product_name}' (ID: {id})."
    }


# ==========================================
# 2. QUẢN LÝ ĐƠN HÀNG (ADMIN)
# ==========================================

@router.get("/orders", response_model=PaginatedOrderResponse)
def admin_get_orders(
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    page_size: int = Query(10, ge=1, le=100, description="Số đơn hàng mỗi trang"),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái: pending, shipping, completed, cancelled"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin] Lấy danh sách toàn bộ đơn hàng trong hệ thống:
    - Hỗ trợ phân trang: page, page_size
    - Lọc theo trạng thái: status
    - Đơn hàng mới nhất xếp lên đầu.
    """
    query = db.query(Order)
    if status and status.strip():
        query = query.filter(Order.status == status.strip())

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(page_size).all()

    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.put("/orders/{id}/status", response_model=OrderResponse)
def admin_update_order_status(
    id: int,
    status_in: OrderUpdateStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin] Cập nhật trạng thái đơn hàng:
    - Giá trị hợp lệ: 'pending', 'shipping', 'completed', 'cancelled'
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đơn hàng với ID {id}."
        )

    order.status = status_in.status
    db.commit()
    db.refresh(order)
    return order


# ==========================================
# 3. THỐNG KÊ DOANH THU & HOẠT ĐỘNG (ADMIN)
# ==========================================

@router.get("/analytics/overview", response_model=AnalyticsOverviewResponse)
def admin_analytics_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin] Thống kê tổng quan tình hình kinh doanh:
    - Tổng doanh thu (tính từ các đơn hàng không bị hủy - completed, shipping, pending)
    - Tổng số đơn hàng
    - Tổng số khách hàng (role == 'customer')
    - Tổng số sản phẩm trong kho
    - Phân bố đơn hàng theo trạng thái
    """
    # 1. Tổng doanh thu (không tính đơn 'cancelled')
    revenue_result = (
        db.query(func.coalesce(func.sum(Order.total_price), 0.0))
        .filter(Order.status != "cancelled")
        .scalar()
    )
    total_revenue = float(revenue_result or 0.0)

    # 2. Tổng số đơn hàng
    total_orders = db.query(Order).count()

    # 3. Tổng số khách hàng
    total_customers = db.query(User).filter(User.role == "customer").count()

    # 4. Tổng số sản phẩm
    total_products = db.query(Product).count()

    # 5. Phân bổ số lượng đơn hàng theo từng trạng thái
    status_counts = (
        db.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )
    orders_by_status = {s: count for s, count in status_counts}

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "orders_by_status": orders_by_status
    }
