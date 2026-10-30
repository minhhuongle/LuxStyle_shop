from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.category import CategoryResponse


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, examples=["Áo Blazer Dạ Tweed Thượng Hạng"])
    description: Optional[str] = Field(None, examples=["Thiết kế phom suông hiện đại, chất liệu dạ tweed cao cấp."])
    price: float = Field(..., gt=0, examples=[1890000.0])
    stock: int = Field(default=0, ge=0, examples=[25])
    category_id: Optional[int] = Field(None, examples=[1])
    image_url: Optional[str] = Field(None, examples=["https://images.unsplash.com/photo-1591047139829-d91aecb6caea"])


class ProductCreate(ProductBase):
    """Schema tạo sản phẩm mới."""
    pass


class ProductUpdate(BaseModel):
    """Schema cập nhật sản phẩm (hỗ trợ cập nhật một phần hoặc toàn bộ)."""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
    """Schema trả về chi tiết sản phẩm kèm thông tin danh mục."""
    id: int
    created_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductResponse(BaseModel):
    """Schema trả về danh sách sản phẩm có phân trang."""
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
