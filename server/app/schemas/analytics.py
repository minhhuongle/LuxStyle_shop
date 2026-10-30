from typing import Dict
from pydantic import BaseModel, Field


class AnalyticsOverviewResponse(BaseModel):
    """Báo cáo thống kê tổng quan doanh thu và hoạt động cửa hàng (Dành cho Admin)."""
    total_revenue: float = Field(..., description="Tổng doanh thu từ các đơn hàng thành công hoặc đang giao")
    total_orders: int = Field(..., description="Tổng số lượng đơn hàng trong hệ thống")
    total_customers: int = Field(..., description="Tổng số lượng khách hàng đã đăng ký")
    total_products: int = Field(..., description="Tổng số lượng sản phẩm trong kho")
    orders_by_status: Dict[str, int] = Field(
        default_factory=dict,
        description="Thống kê số lượng đơn hàng theo từng trạng thái"
    )
