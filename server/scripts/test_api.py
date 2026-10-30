"""
Comprehensive API Endpoint Validation Script
Tests all RESTful endpoints and AI Chatbot in-process using FastAPI TestClient.
"""

import sys
from pathlib import Path

# Add server directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def run_tests():
    print("=" * 60)
    print("🧪 RUNNING COMPREHENSIVE REST API & CHATBOT TESTS")
    print("=" * 60)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ [1/10] GET /health -> 200 OK")

    # 2. Login Admin
    res = client.post("/api/auth/login", json={"email": "admin@store.com", "password": "admin123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    admin_token = admin_data["access_token"]
    assert admin_data["user"]["role"] == "admin"
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✅ [2/10] POST /api/auth/login (Admin JWT with role) -> 200 OK")

    # 3. Login Customer
    res = client.post("/api/auth/login", json={"email": "customer@store.com", "password": "customer123"})
    assert res.status_code == 200, f"Customer login failed: {res.text}"
    cust_data = res.json()
    cust_token = cust_data["access_token"]
    assert cust_data["user"]["role"] == "customer"
    cust_headers = {"Authorization": f"Bearer {cust_token}"}
    print("✅ [3/10] POST /api/auth/login (Customer JWT with role) -> 200 OK")

    # 4. GET /api/products (Pagination, keyword, category, price range)
    res = client.get("/api/products?page=1&page_size=5&keyword=blazer&min_price=1000000")
    assert res.status_code == 200, f"Get products failed: {res.text}"
    prod_data = res.json()
    assert "items" in prod_data and "total" in prod_data
    assert prod_data["page"] == 1
    print(f"✅ [4/10] GET /api/products (Filter & Pagination) -> Found {prod_data['total']} items")

    # 5. GET /api/products/{id}
    res = client.get("/api/products/1")
    assert res.status_code == 200, f"Product detail failed: {res.text}"
    product_1 = res.json()
    print(f"✅ [5/10] GET /api/products/1 -> '{product_1['name']}' ({product_1['price']:,.0f} VND)")

    # 6. POST /api/orders & GET /api/orders/my-orders
    order_payload = {
        "items": [
            {"product_id": 1, "quantity": 1}
        ]
    }
    res = client.post("/api/orders/", json=order_payload, headers=cust_headers)
    assert res.status_code == 201, f"Create order failed: {res.text}"
    created_order = res.json()
    print(f"✅ [6/10] POST /api/orders -> Order #{created_order['id']} created, Total: {created_order['total_price']:,.0f} VND")

    res = client.get("/api/orders/my-orders", headers=cust_headers)
    assert res.status_code == 200, f"Get my orders failed: {res.text}"
    my_orders = res.json()
    assert len(my_orders) >= 1
    print(f"✅ [7/10] GET /api/orders/my-orders -> {len(my_orders)} orders in history")

    # 7. Admin CRUD Products
    new_prod_payload = {
        "name": "Khuyên Tai Ngọc Trai Baroque Hoàng Gia",
        "description": "Ngọc trai nước ngọt tự nhiên dáng baroque độc bản, chốt bạc 925 mạ vàng trắng sang trọng.",
        "price": 1250000.0,
        "stock": 10,
        "category_id": 5,
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
    }
    res = client.post("/api/admin/products", json=new_prod_payload, headers=admin_headers)
    assert res.status_code == 201, f"Admin create product failed: {res.text}"
    admin_prod = res.json()
    prod_id = admin_prod["id"]

    # Admin Update Product
    update_payload = {"price": 1350000.0, "stock": 15}
    res = client.put(f"/api/admin/products/{prod_id}", json=update_payload, headers=admin_headers)
    assert res.status_code == 200, f"Admin update product failed: {res.text}"
    assert res.json()["price"] == 1350000.0

    # Admin Delete Product
    res = client.delete(f"/api/admin/products/{prod_id}", headers=admin_headers)
    assert res.status_code == 200, f"Admin delete product failed: {res.text}"
    print(f"✅ [8/10] Admin Product CRUD (POST, PUT, DELETE #{prod_id}) -> All 200/201 OK")

    # 8. Admin Orders & Analytics
    res = client.get("/api/admin/orders", headers=admin_headers)
    assert res.status_code == 200
    admin_orders = res.json()

    # Update order status
    target_order_id = created_order["id"]
    res = client.put(f"/api/admin/orders/{target_order_id}/status", json={"status": "shipping"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "shipping"

    # Analytics Overview
    res = client.get("/api/admin/analytics/overview", headers=admin_headers)
    assert res.status_code == 200
    overview = res.json()
    print(f"✅ [9/10] Admin Analytics & Orders -> Revenue: {overview['total_revenue']:,.0f} VND, Orders: {overview['total_orders']}, Customers: {overview['total_customers']}")

    # 9. AI Chatbot Tư vấn bán hàng
    chat_payload = {
        "message": "Tôi đang cần tìm một chiếc áo khoác blazer dạ tweed để đi gặp đối tác quan trọng",
        "history": []
    }
    res = client.post("/api/chat/", json=chat_payload)
    assert res.status_code == 200, f"Chat failed: {res.text}"
    chat_data = res.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 20
    print(f"✅ [10/10] POST /api/chat -> AI Advisor replied successfully!")
    print(f"   💬 Trích xuất phản hồi: \"{chat_data['reply'][:120]}...\"")

    print("\n" + "=" * 60)
    print("🎉 ALL 10 TESTS PASSED PERFECTLY WITH ZERO ERRORS!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
