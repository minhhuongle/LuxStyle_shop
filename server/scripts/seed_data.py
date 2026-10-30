"""
Database Seeding Script for LuxeStyle Fashion & Accessories E-Commerce
Creates:
- Default Admin Account: admin@store.com / admin123
- Sample Customer Account: customer@store.com / customer123
- 6 Realistic Fashion & Accessories Categories
- 12 High-Quality Sample Products with Unsplash Images
- Sample Orders & Order Items
"""

import sys
import os
from pathlib import Path

# Add the server directory to sys.path so 'app' can be imported cleanly
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem


def seed_database():
    print("=" * 60)
    print("🚀 LUXESTYLE E-COMMERCE: SEEDING DATABASE")
    print("=" * 60)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. SEED USERS
        print("\n[1/4] 👤 Seeding Users...")
        admin_email = "admin@store.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                username="admin",
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            print(f"  ✅ Created Admin: {admin_email} (Password: admin123)")
        else:
            print(f"  ℹ️ Admin already exists: {admin_email}")

        customer_email = "customer@store.com"
        customer = db.query(User).filter(User.email == customer_email).first()
        if not customer:
            customer = User(
                username="johndoe",
                email=customer_email,
                hashed_password=get_password_hash("customer123"),
                role="customer"
            )
            db.add(customer)
            print(f"  ✅ Created Customer: {customer_email} (Password: customer123)")
        else:
            print(f"  ℹ️ Customer already exists: {customer_email}")

        db.commit()

        # Refresh instances
        db.refresh(admin)
        db.refresh(customer)

        # 2. SEED CATEGORIES
        print("\n[2/4] 🏷️ Seeding Categories...")
        categories_data = [
            {"name": "Áo & Trang Phục", "slug": "ao-trang-phuc"},
            {"name": "Váy & Đầm Thiết Kế", "slug": "vay-dam-thiet-ke"},
            {"name": "Túi Xách & Ví Da", "slug": "tui-xach-vi-da"},
            {"name": "Giày & Sneakers", "slug": "giay-sneakers"},
            {"name": "Kính Mát & Phụ Kiện", "slug": "kinh-mat-phu-kien"},
            {"name": "Đồng Hồ Cao Cấp", "slug": "dong-ho-cao-cap"},
        ]

        cat_map = {}
        for cat in categories_data:
            existing = db.query(Category).filter(Category.slug == cat["slug"]).first()
            if not existing:
                new_cat = Category(name=cat["name"], slug=cat["slug"])
                db.add(new_cat)
                db.commit()
                db.refresh(new_cat)
                cat_map[cat["slug"]] = new_cat
                print(f"  ✅ Created Category: {cat['name']} ({cat['slug']})")
            else:
                cat_map[cat["slug"]] = existing
                print(f"  ℹ️ Category exists: {cat['name']}")

        # 3. SEED PRODUCTS
        print("\n[3/4] 👗 Seeding Products (Fashion & Accessories)...")
        products_data = [
            {
                "name": "Áo Blazer Dạ Tweed Thượng Hạng",
                "description": "Thiết kế phom suông thanh lịch phong cách Pháp, chất dạ tweed dệt họa tiết xương cá cao cấp, lớp lót lụa mềm mại. Phù hợp cho công sở và tiệc nhẹ.",
                "price": 1850000.0,
                "stock": 25,
                "category_slug": "ao-trang-phuc",
                "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Áo Sơ Mi Lụa Tơ Tằm Tối Giản",
                "description": "Dệt từ 100% lụa tơ tằm tự nhiên, bề mặt óng ả mềm mại, cúc ngọc trai tự nhiên tinh xảo, thoáng mát và sang trọng.",
                "price": 950000.0,
                "stock": 40,
                "category_slug": "ao-trang-phuc",
                "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Áo Khoác Trench Coat Dáng Dài Parisian",
                "description": "Áo trench coat chất liệu kaki dệt chéo chống thấm nước nhẹ, đai eo tôn dáng, chi tiết cúc sừng cổ điển vượt thời gian.",
                "price": 2650000.0,
                "stock": 18,
                "category_slug": "ao-trang-phuc",
                "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Đầm Lụa Satin Cổ Yếm Emerald Luxe",
                "description": "Thiết kế cổ yếm khoe bờ vai thon gọn, chất liệu satin rủ nhẹ nhàng ôm lấy từng bước chuyển động, sắc ngọc lục bảo huyền bí.",
                "price": 1450000.0,
                "stock": 30,
                "category_slug": "vay-dam-thiet-ke",
                "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Đầm Xòe Ren Pháp Dạ Tiệc Quý Tộc",
                "description": "Chất ren thêu hoa văn Pháp tinh xảo trên nền voan tơ cao cấp, phom xòe tiểu thư sang trọng tuyệt đối cho các buổi tiệc tối.",
                "price": 2190000.0,
                "stock": 15,
                "category_slug": "vay-dam-thiet-ke",
                "image_url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Túi Xách Da Bò Epsom Quai Kim Loại",
                "description": "Da bò Epsom cao cấp nhập khẩu từ Ý với độ bền vượt trội và vân da sang trọng. Khóa hợp kim mạ vàng 18K chống xước tinh xảo.",
                "price": 3200000.0,
                "stock": 12,
                "category_slug": "tui-xach-vi-da",
                "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Túi Tote Da Thật Đa Năng Minimalist",
                "description": "Túi xách da đựng vừa laptop 14-16 inch, thiết kế tối giản không lỗi mốt, quai xách chịu lực êm ái thích hợp công sở hàng ngày.",
                "price": 1750000.0,
                "stock": 28,
                "category_slug": "tui-xach-vi-da",
                "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Ví Dài Cầm Tay Da Cá Sấu Dập Nổi",
                "description": "Ví dài cầm tay thời thượng dập vân da cá sấu bóng mờ sang trọng, chia nhiều ngăn đựng thẻ tín dụng và tiền mặt tiện dụng.",
                "price": 1120000.0,
                "stock": 20,
                "category_slug": "tui-xach-vi-da",
                "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Giày Cao Gót Mũi Nhọn Da Bóng Stiletto",
                "description": "Độ cao 7cm chuẩn phong cách công sở và dạ tiệc, lót đệm êm chân chống mỏi, phom mũi nhọn tạo hiệu ứng đôi chân dài miên man.",
                "price": 1590000.0,
                "stock": 22,
                "category_slug": "giay-sneakers",
                "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Sneakers Da Bê Thuần Khiết Scandinavian",
                "description": "Thiết kế giày thể thao tối giản chuẩn phong cách Bắc Âu, 100% da bê mềm mại, đế cao su thiên nhiên êm ái linh hoạt khi di chuyển.",
                "price": 1680000.0,
                "stock": 35,
                "category_slug": "giay-sneakers",
                "image_url": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Kính Mát Phi Công Mạ Vàng Polarized",
                "description": "Gọng kim loại titanium siêu nhẹ mạ vàng bóng bẩy, tròng kính phân cực polarized lọc 100% tia UV400 và chống lóa mắt ban ngày.",
                "price": 890000.0,
                "stock": 50,
                "category_slug": "kinh-mat-phu-kien",
                "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Đồng Hồ Cơ Automatic Tối Giản Mặt Sapphire",
                "description": "Kính sapphire nguyên khối chống trầy, bộ máy cơ automatic lộ cơ tinh tế ở mặt sau, trữ cót 42 giờ, dây da bò nhập Ý may thủ công.",
                "price": 4890000.0,
                "stock": 8,
                "category_slug": "dong-ho-cao-cap",
                "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
            },
        ]

        created_products = []
        for prod in products_data:
            existing = db.query(Product).filter(Product.name == prod["name"]).first()
            cat = cat_map.get(prod["category_slug"])
            cat_id = cat.id if cat else None

            if not existing:
                new_prod = Product(
                    name=prod["name"],
                    description=prod["description"],
                    price=prod["price"],
                    stock=prod["stock"],
                    category_id=cat_id,
                    image_url=prod["image_url"]
                )
                db.add(new_prod)
                db.commit()
                db.refresh(new_prod)
                created_products.append(new_prod)
                print(f"  ✅ Created Product: {prod['name']} - {prod['price']:,.0f} VND")
            else:
                created_products.append(existing)
                print(f"  ℹ️ Product exists: {prod['name']}")

        # 4. SEED SAMPLE ORDER
        print("\n[4/4] 📦 Seeding Sample Order...")
        existing_orders = db.query(Order).filter(Order.user_id == customer.id).count()
        if existing_orders == 0 and len(created_products) >= 2:
            prod1 = created_products[0]
            prod2 = created_products[10]

            sample_order = Order(
                user_id=customer.id,
                total_price=prod1.price * 1 + prod2.price * 1,
                status="shipping"
            )
            item1 = OrderItem(product_id=prod1.id, quantity=1, price=prod1.price)
            item2 = OrderItem(product_id=prod2.id, quantity=1, price=prod2.price)
            sample_order.order_items = [item1, item2]

            db.add(sample_order)
            db.commit()
            print(f"  ✅ Created Sample Order #{sample_order.id} for {customer.email} (Status: shipping)")
        else:
            print("  ℹ️ Sample order already exists.")

        print("\n" + "=" * 60)
        print("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Admin Credentials:    {admin_email} / admin123")
        print(f"Customer Credentials: {customer_email} / customer123")
        print(f"Categories Count:     {db.query(Category).count()}")
        print(f"Products Count:       {db.query(Product).count()}")
        print(f"Orders Count:         {db.query(Order).count()}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during database seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
