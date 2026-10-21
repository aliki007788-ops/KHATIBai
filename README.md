# خطیب V1 — فرانت + بک‌اند

## ساختار
- `frontend/` — Next.js 15
- `backend/` — FastAPI (بدون venv)
- `docs/` — پچ پرداخت و راهنمای production

## اجرای بک‌اند
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
# JWT_SECRET و PASSWORD_PEPPER را عوض کن
# CORS_ORIGINS=http://localhost:3000
# FRONTEND_URL=http://localhost:3000
uvicorn app.main:app --reload --port 8000
```

## اجرای فرانت
```bash
cd frontend
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm install
npm run dev
```

مرورگر: http://localhost:3000

## مهم production
فایل `docs/APPLY_V1.md` را بخوان.
اگر در config فیلد frontend_url نیست، اضافه کن:
`frontend_url: str = Field(default="http://localhost:3000")`
