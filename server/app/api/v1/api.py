from fastapi import APIRouter
from app.api.v1.endpoints import auth, categories, products, orders, admin, chat

api_router = APIRouter()

# Register all modular endpoint routers
api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(admin.router)
api_router.include_router(chat.router)
