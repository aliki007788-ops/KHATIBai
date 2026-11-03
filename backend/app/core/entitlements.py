"""وابستگی FastAPI برای قفل‌کردن بخش‌ها بر اساس پلن کاربر."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.services import plan_service


def require_section(key: str):
    def _dep(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if key not in plan_service.sections_for_user(db, user):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "این بخش در پلن فعلی شما فعال نیست. برای دسترسی، پلن خود را ارتقا دهید.",
            )
        return user

    return _dep
