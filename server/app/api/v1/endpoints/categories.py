from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.api.deps import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """List all categories."""
    return db.query(Category).order_by(Category.id.asc()).all()


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get category by ID."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Create a new category (Admin only)."""
    if db.query(Category).filter(Category.slug == category_in.slug).first():
        raise HTTPException(status_code=400, detail="Category slug already exists.")

    category = Category(name=category_in.name, slug=category_in.slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
