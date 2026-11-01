from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.models import AudienceSession

def create(db: Session, user_id: str, data: dict) -> AudienceSession:
    row = AudienceSession(user_id=user_id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

def list_for_user(db: Session, user_id: str, limit: int = 20) -> list[AudienceSession]:
    rows = db.execute(
        select(AudienceSession)
        .where(AudienceSession.user_id == user_id)
        .order_by(AudienceSession.created_at.desc())
        .limit(limit)
    ).scalars().all()
    return list(rows)
