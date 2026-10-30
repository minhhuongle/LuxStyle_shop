from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# OAuth2 scheme looking for Bearer token in Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """
    Dependency kiểm tra tính hợp lệ của JWT token từ Authorization Header.
    Trả về đối tượng User hiện tại đang đăng nhập.
    Ném lỗi 401 Unauthorized nếu token không hợp lệ hoặc đã hết hạn.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Thông tin xác thực không hợp lệ hoặc phiên đăng nhập đã hết hạn.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_exception

    return user


def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency kiểm tra phân quyền Quản trị viên (Admin).
    Chỉ cho phép người dùng có role == 'admin' tiếp tục request.
    Ném lỗi 403 Forbidden nếu là customer hoặc không đủ thẩm quyền.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin)."
        )
    return current_user


# Alias cho tính tương thích
get_current_admin = require_admin
