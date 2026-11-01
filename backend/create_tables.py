from app.core.database import Base, engine
from app.models import *  # همه مدل‌ها را import کنید تا Base از آن‌ها خبر داشته باشد

Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully.")