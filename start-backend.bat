@echo off
chcp 65001 >nul
title Backend - خطیب
cd /d "%~dp0backend"

where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python پیدا نشد. از python.org نصب کن و PATH را فعال کن.
  pause
  exit /b 1
)

if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
  if errorlevel 1 (
    echo [ERROR] ساخت venv ناموفق بود.
    pause
    exit /b 1
  )
)

call venv\Scripts\activate.bat
if errorlevel 1 (
  echo [ERROR] فعال‌سازی venv ناموفق بود.
  pause
  exit /b 1
)

echo Installing / updating requirements...
python -m pip install --upgrade pip -q
pip install -r requirements.txt -q
if errorlevel 1 (
  echo [ERROR] نصب requirements ناموفق بود.
  pause
  exit /b 1
)

if not exist .env (
  echo Creating .env from .env.example...
  if exist .env.example (
    copy .env.example .env >nul
  ) else (
    echo DATABASE_URL=sqlite:///./khatib.db>.env
    echo JWT_SECRET=dev-change-me-please-32chars-min>>.env
    echo PASSWORD_PEPPER=dev-pepper-change-me>>.env
    echo CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000>>.env
    echo FRONTEND_URL=http://localhost:3000>>.env
  )
)

echo.
echo Starting FastAPI on http://localhost:8000
echo Docs: http://localhost:8000/docs
echo ============================================
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
if errorlevel 1 (
  echo.
  echo [ERROR] uvicorn متوقف شد یا استارت نشد.
  pause
)