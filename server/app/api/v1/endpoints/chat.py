"""
AI Chatbot Endpoint:
- POST /api/chat: Tư vấn bán hàng thời trang thông minh tích hợp Google Gemini API
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import generate_chat_response

router = APIRouter(prefix="/chat", tags=["AI Sales Chatbot"])


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_with_advisor(
    chat_in: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Tư vấn bán hàng thông minh qua AI Chatbot (Google Gemini):
    - Tiếp nhận tin nhắn hiện tại (`message`) và toàn bộ ngữ cảnh hội thoại (`history`).
    - Nạp danh mục sản phẩm thực tế từ database vào System Instruction.
    - Trả lời phong cách tư vấn thời trang cao cấp, đề xuất chính xác tên, giá và link sản phẩm.
    - Xử lý an toàn: Tự động chuyển đổi sang Heuristic Matching Engine nếu chưa có GEMINI_API_KEY hoặc lỗi kết nối.
    """
    result = generate_chat_response(
        message=chat_in.message,
        history=chat_in.history,
        db=db
    )
    return result
