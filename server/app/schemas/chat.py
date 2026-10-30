from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Một tin nhắn trong lịch sử trò chuyện."""
    role: Literal["user", "model", "assistant"] = Field(..., description="Người gửi: 'user' hoặc 'model'/'assistant'")
    content: str = Field(..., description="Nội dung tin nhắn")


class ChatRequest(BaseModel):
    """Payload gửi lên Chatbot tư vấn bán hàng."""
    message: str = Field(..., min_length=1, description="Câu hỏi hoặc yêu cầu tư vấn của khách hàng")
    history: List[ChatMessage] = Field(default=[], description="Lịch sử hội thoại trước đó để giữ ngữ cảnh")


class ChatProductRecommendation(BaseModel):
    id: int
    name: str
    price: float
    image_url: Optional[str] = None
    category_name: Optional[str] = None


class ChatResponse(BaseModel):
    """Câu trả lời từ trợ lý AI và danh sách sản phẩm gợi ý đính kèm."""
    reply: str = Field(..., description="Nội dung phản hồi tư vấn của AI")
    suggested_products: List[ChatProductRecommendation] = Field(
        default=[],
        description="Danh sách sản phẩm phù hợp được gợi ý trực tiếp từ kho"
    )
