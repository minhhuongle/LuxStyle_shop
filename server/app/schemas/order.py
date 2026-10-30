from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.product import ProductResponse


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0, examples=[1])
    price: float = Field(..., gt=0, examples=[1850000.0])


class OrderItemCreate(BaseModel):
    """Mỗi sản phẩm trong giỏ hàng gửi lên khi tạo đơn hàng."""
    product_id: int = Field(..., description="ID sản phẩm cần mua")
    quantity: int = Field(default=1, gt=0, description="Số lượng đặt mua")


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    """Payload tạo đơn hàng mới từ giỏ hàng."""
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Danh sách sản phẩm trong giỏ hàng")


class OrderUpdateStatus(BaseModel):
    """Payload cập nhật trạng thái đơn hàng (Dành cho Admin)."""
    status: Literal["pending", "shipping", "completed", "cancelled", "return_requested", "returned"] = Field(
        ...,
        description="Trạng thái mới của đơn hàng"
    )


class OrderResponse(BaseModel):
    """Chi tiết đơn hàng trả về cho Client và Admin."""
    id: int
    user_id: int
    total_price: float
    status: Literal["pending", "shipping", "completed", "cancelled", "return_requested", "returned"]
    created_at: datetime
    order_items: List[OrderItemResponse] = []
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedOrderResponse(BaseModel):
    """Danh sách đơn hàng phân trang cho Admin."""
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
