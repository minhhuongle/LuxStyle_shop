"""
AI Sales Advisor Chatbot Service
Integrates Google Gemini API using google-genai SDK.
Injects real products from SQLite database into System Context.
Includes resilient fallback heuristic engine when API Key is missing or external API fails.
"""

from typing import List, Optional, Dict, Any
import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.product import Product
from app.schemas.chat import ChatMessage, ChatProductRecommendation

logger = logging.getLogger("chat_service")


def get_available_products(db: Session, limit: int = 50) -> List[Product]:
    """Lấy danh sách các sản phẩm thực tế còn hàng trong kho."""
    return db.query(Product).filter(Product.stock > 0).limit(limit).all()


def build_system_instruction(products: List[Product]) -> str:
    """Xây dựng System Instruction cung cấp ngữ cảnh thời trang và kho sản phẩm hiện tại."""
    product_lines = []
    for p in products:
        cat_name = p.category.name if p.category else "Thời trang"
        product_lines.append(
            f"- [ID: {p.id}] {p.name} | Danh mục: {cat_name} | Giá: {p.price:,.0f} VND | Tồn kho: {p.stock} | Link ảnh: {p.image_url} | Mô tả: {p.description}"
        )
    catalog_text = "\n".join(product_lines)

    instruction = f"""
Bạn là Chuyên viên tư vấn phong cách & bán hàng cao cấp tại thương hiệu thời trang LuxeStyle (Haute Couture & Accessories).
Phong cách giao tiếp của bạn: Lịch thiệp, tinh tế, sang trọng, ấm áp và am hiểu sâu sắc về thời trang, chất liệu (dạ tweed, lụa tơ tằm, da bò Epsom, len cashmere, mặt kính sapphire...).

KHO SẢN PHẨM HIỆN CÓ CỦA CỬA HÀNG:
{catalog_text}

QUY TẮC BẮT BUỘC KHI TƯ VẤN:
1. Chỉ giới thiệu và đề xuất các sản phẩm CÓ THỰC trong danh sách kho bên trên.
2. Khi gợi ý sản phẩm, hãy nêu chính xác Tên sản phẩm, Giá bán bằng VND (ví dụ: 1,850,000 VND), và giải thích vì sao sản phẩm phù hợp với dáng người/hoàn cảnh (đi tiệc, công sở, dạo phố, quà tặng).
3. Khuyến khích tư vấn phối đồ (Mix & Match) thông minh giữa trang phục chính (blazer, đầm, áo) với phụ kiện (túi xách, giày cao gót, sneakers, kính mát, đồng hồ) để tạo phong cách hoàn chỉnh.
4. Trả lời bằng tiếng Việt thanh lịch, ngắn gọn, súc tích và có cấu trúc rõ ràng.
"""
    return instruction.strip()


def heuristic_fallback_reply(message: str, products: List[Product]) -> Dict[str, Any]:
    """
    Fallback Engine: Xử lý an toàn khi không có GEMINI_API_KEY hoặc khi gọi API gặp sự cố.
    Tìm kiếm sản phẩm phù hợp theo từ khóa trong tin nhắn của khách hàng.
    """
    msg_lower = message.lower()
    matched_products = []

    keywords = {
        "blazer": ["blazer", "áo khoác", "vest", "dạ tweed", "công sở"],
        "áo": ["áo", "sơ mi", "lụa", "tơ tằm", "trench coat"],
        "đầm": ["đầm", "váy", "dạ tiệc", "satin", "yếm", "ren"],
        "túi": ["túi", "tote", "clutch", "ví", "da bò", "da cá sấu"],
        "giày": ["giày", "cao gót", "sneaker", "sneakers", "mũi nhọn"],
        "kính": ["kính", "mát", "râm", "phi công", "polarized"],
        "đồng hồ": ["đồng hồ", "automatic", "sapphire", "cơ"],
    }

    # Match products
    for p in products:
        p_text = f"{p.name} {p.description}".lower()
        if any(term in msg_lower for term in p_text.split()):
            matched_products.append(p)
        else:
            for cat_key, terms in keywords.items():
                if any(t in msg_lower for t in terms) and any(t in p_text for t in terms):
                    if p not in matched_products:
                        matched_products.append(p)

    if not matched_products:
        # Nếu không có từ khóa trùng khớp, gợi ý 3 sản phẩm nổi bật
        matched_products = products[:3]
    else:
        matched_products = matched_products[:4]

    # Format reply
    recommendations_text = []
    suggested_dto = []
    for p in matched_products:
        cat_name = p.category.name if p.category else "Thời trang"
        recommendations_text.append(
            f"• **{p.name}** - Giá: **{p.price:,.0f} VND**\n  _{p.description}_"
        )
        suggested_dto.append(
            ChatProductRecommendation(
                id=p.id,
                name=p.name,
                price=p.price,
                image_url=p.image_url,
                category_name=cat_name
            )
        )

    items_block = "\n\n".join(recommendations_text)
    reply = (
        f"Kính chào quý khách! Cảm ơn quý khách đã ghé thăm LuxeStyle.\n\n"
        f"Dựa trên yêu cầu của quý khách, chuyên viên thời trang xin trân trọng gợi ý những thiết kế tinh tuyển sau đây:\n\n"
        f"{items_block}\n\n"
        f"Quý khách có thể xem chi tiết hoặc thêm trực tiếp vào giỏ hàng. Quý khách cần tư vấn thêm về kích thước hoặc cách phối phụ kiện đi kèm không ạ?"
    )

    return {
        "reply": reply,
        "suggested_products": suggested_dto
    }


def generate_chat_response(
    message: str,
    history: List[ChatMessage],
    db: Session
) -> Dict[str, Any]:
    """
    Sinh câu trả lời từ Google Gemini API hoặc chuyển đổi an toàn sang Heuristic Engine.
    """
    products = get_available_products(db, limit=30)

    # 1. Kiểm tra API Key
    api_key = settings.GEMINI_API_KEY
    if not api_key or not api_key.strip():
        logger.info("GEMINI_API_KEY is not configured. Using intelligent fallback advisor.")
        return heuristic_fallback_reply(message, products)

    # 2. Gọi Google Gemini API bằng google-genai SDK
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=25000)
        )
        system_instruction = build_system_instruction(products)

        # Chuyển đổi lịch sử chat
        contents = []
        for msg in history:
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.content)]
            ))

        # Thêm tin nhắn hiện tại của user
        contents.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=message)]
        ))

        # Gọi mô hình
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=1000,
            )
        )

        reply_text = response.text or "Rất tiếc, tôi chưa thể trả lời câu hỏi này ngay bây giờ."

        # Trích xuất danh sách sản phẩm được nhắc đến để hiển thị card đính kèm
        suggested_dto = []
        for p in products:
            if p.name.lower() in reply_text.lower():
                cat_name = p.category.name if p.category else "Thời trang"
                suggested_dto.append(
                    ChatProductRecommendation(
                        id=p.id,
                        name=p.name,
                        price=p.price,
                        image_url=p.image_url,
                        category_name=cat_name
                    )
                )

        return {
            "reply": reply_text,
            "suggested_products": suggested_dto[:4]
        }

    except Exception as exc:
        logger.warning(f"Gemini API call failed with error: {exc}. Switching to graceful fallback.")
        return heuristic_fallback_reply(message, products)
