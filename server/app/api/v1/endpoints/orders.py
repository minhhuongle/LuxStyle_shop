"""
Client Order Endpoints:
- POST /api/orders: Tạo đơn hàng mới từ giỏ hàng (tự động tính tổng tiền từ DB, trừ stock, tạo order_items)
- GET /api/orders/my-orders: Xem lịch sử đơn hàng của user đang đăng nhập
- GET /api/orders/{id}: Xem chi tiết một đơn hàng cụ thể
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders (Client)"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tạo đơn hàng mới từ giỏ hàng:
    - Luồng dữ liệu:
      1. Kiểm tra danh sách giỏ hàng không rỗng.
      2. Truy vấn giá sản phẩm và tồn kho trực tiếp từ database (tránh gian lận giá từ client).
      3. Kiểm tra số lượng tồn kho (stock >= quantity).
      4. Trừ tồn kho tương ứng của từng sản phẩm.
      5. Tính toán tổng tiền chính xác = sum(product.price * quantity).
      6. Lưu bản ghi Order và danh sách OrderItem trong một transaction duy nhất.
    """
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giỏ hàng của bạn đang trống. Vui lòng chọn ít nhất một sản phẩm."
        )

    total_price = 0.0
    items_to_save = []

    # Transaction xử lý đơn hàng
    try:
        for item in order_in.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sản phẩm với ID {item.product_id} không tồn tại trong hệ thống."
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm '{product.name}' chỉ còn {product.stock} chiếc trong kho (bạn yêu cầu {item.quantity})."
                )

            # 1. Trừ tồn kho
            product.stock -= item.quantity

            # 2. Lấy giá chuẩn từ database để tính tiền
            unit_price = product.price
            total_price += unit_price * item.quantity

            # 3. Tạo order item
            order_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=unit_price
            )
            items_to_save.append(order_item)

        # 4. Tạo bản ghi đơn hàng
        new_order = Order(
            user_id=current_user.id,
            total_price=round(total_price, 2),
            status="pending"
        )
        new_order.order_items = items_to_save

        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xử lý đặt hàng: {str(exc)}"
        )


@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Xem lịch sử đơn hàng của người dùng hiện tại đang đăng nhập.
    Sắp xếp đơn hàng mới nhất lên đầu, bao gồm thông tin chi tiết từng sản phẩm đã mua.
    """
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/{id}", response_model=OrderResponse)
def get_order_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Xem chi tiết một đơn hàng cụ thể theo ID.
    Khách hàng chỉ có thể xem đơn hàng của chính mình.
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem thông tin đơn hàng này."
        )
    return order


@router.put("/{id}/return", response_model=OrderResponse)
def request_order_return(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Khách hàng gửi yêu cầu trả hàng / đổi trả:
    - Áp dụng cho đơn hàng của người dùng.
    - Cập nhật trạng thái thành 'return_requested'.
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")

    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thao tác trên đơn hàng này."
        )

    if order.status in ["cancelled", "returned"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Đơn hàng hiện đang ở trạng thái '{order.status}', không thể gửi yêu cầu trả hàng."
        )

    order.status = "return_requested"
    db.commit()
    db.refresh(order)
    return order

