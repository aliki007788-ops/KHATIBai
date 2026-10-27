from app.core.db import SessionLocal
from app.core.models import User, PlanEnum

db = SessionLocal()
u = db.query(User).filter(User.email == "test@khatib.com").first()

if u:
    print(f"Current plan: {u.plan}")
    u.plan = PlanEnum.pro
    db.commit()
    print(f"Updated to: {u.plan}")
else:
    print("User not found!")