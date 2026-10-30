"""
Client Product Endpoints:
- GET /api/products: Phân trang (page, page_size), tìm kiếm (keyword), lọc danh mục (category_id), lọc khoảng giá (min_price, max_price)
- GET /api/products/{id}: Xem chi tiết sản phẩm
"""

import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse, PaginatedProductResponse

router = APIRouter(prefix="/products", tags=["Products (Client)"])


@router.get("/", response_model=PaginatedProductResponse)
def get_products(
    page: int = Query(1, ge=1, description="Số trang hiện tại (bắt đầu từ 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Số sản phẩm trên mỗi trang"),
    keyword: Optional[str] = Query(None, description="Từ khóa tìm kiếm theo tên hoặc mô tả"),
    category_id: Optional[int] = Query(None, description="Lọc theo ID danh mục"),
    min_price: Optional[float] = Query(None, ge=0, description="Lọc giá tối thiểu (VND)"),
    max_price: Optional[float] = Query(None, ge=0, description="Lọc giá tối đa (VND)"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách sản phẩm cho khách hàng với các bộ lọc phong phú:
    - Phân trang: page, page_size
    - Tìm kiếm: keyword (tìm trong cả Tên và Mô tả)
    - Lọc danh mục: category_id
    - Lọc khoảng giá: min_price đến max_price
    """
    query = db.query(Product)

    # 1. Tìm kiếm từ khóa (Keyword search)
    if keyword and keyword.strip():
        search_pattern = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern)
            )
        )

    # 2. Lọc theo danh mục (Category filter)
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    # 3. Lọc theo khoảng giá (Price range filter)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # 4. Tính toán phân trang
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    items = query.order_by(Product.id.desc()).offset(offset).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/{id}", response_model=ProductResponse)
def get_product_detail(id: int, db: Session = Depends(get_db)):
    """
    Xem chi tiết sản phẩm theo ID.
    Trả về đầy đủ thông tin sản phẩm và thông tin danh mục tương ứng.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm với ID {id}."
        )
    return product
