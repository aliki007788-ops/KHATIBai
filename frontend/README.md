# خطیب (Khatib) — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind v4 + Zustand + TanStack Query + Axios

## هم‌ترازی با Backend

این فرانت با APIهای واقعی FastAPI در `khatib1` هم‌تراز شده است:

| موضوع | Backend | Frontend |
|--------|---------|----------|
| Login | `email` + `password` → `TokenResponse` + cookie `khatib_refresh` | ✅ |
| Register | `email`, `password`, `name?` → `UserResponse` (بدون توکن) | ✅ سپس هدایت به login |
| Refresh | Cookie-based `POST /api/auth/refresh` | ✅ `withCredentials: true` |
| Response shape | مدل مستقیم (بدون `{success,data}`) | ✅ |
| Errors | `{ detail: string \| ValidationError[] }` | ✅ |
| Plans | free / base / pro / enterprise | ✅ مطابق `plans.py` |
| Progress | `practice_count`, `best_score`, `average_score`, ... | ✅ |
| Billing | `POST /checkout { plan }` → `payment_url` | ✅ |

### تفاوت‌های مهم با طراحی اولیه متنی

1. **بدون refresh_token در body** — فقط httpOnly cookie
2. **Register لاگین نمی‌کند** — کاربر باید login کند
3. **فیلد identifier وجود ندارد** — فقط email
4. **رمز عبور**: حداقل ۸ کاراکتر + حرف + عدد
5. **بدون billing cycle ماهانه/سالانه** در API فعلی
6. **Progress fields** متفاوت از طراحی فرضی اولیه

## اجرا

```bash
# Backend روی :8000 با:
# CORS_ORIGINS=http://localhost:3000
# COOKIE_SECURE=false

cd khatib-frontend
npm install
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## ساختار

```
src/
├── app/
│   ├── (public)/     Landing, pricing, about, help, privacy, terms
│   ├── (auth)/       login, register, forgot-password
│   ├── dashboard/
│   └── checkout/
├── components/       ui, layout, billing, public
├── features/         auth, dashboard, billing
├── lib/api/          client (interceptors + refresh queue), endpoints, errors
├── stores/           authStore, uiStore
└── types/            هم‌تراز با schemas بک‌اند
```

## اولویت پیاده‌سازی

### فاز A — پایه (انجام‌شده)
- [x] apiClient + auto-refresh با cookie
- [x] Auth کامل (login / register / me / logout)
- [x] Dashboard با summary واقعی Backend
- [x] Pricing عمومی + Checkout → زرین‌پال
- [x] صفحات عمومی

### فاز B — هسته محصول (بعدی)
1. تمرین Speech (متن + صوت + نتیجه تحلیل)
2. مربی AI / Chat
3. Learning (levels → scenarios)
4. Progress trends + نمودار

### فاز C — تکمیل
5. Settings / Privacy (export + delete)
6. History
7. Eitaa link
8. Admin panel
