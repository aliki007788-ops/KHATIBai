@echo off
chcp 65001 >nul
title Frontend - خطیب
cd /d "%~dp0frontend"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js پیدا نشد. از nodejs.org نسخه LTS نصب کن.
  pause
  exit /b 1
)

if not exist .env.local (
  echo Creating .env.local...
  > .env.local echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
)

echo Checking npm packages...
if not exist node_modules (
  echo Installing packages ^(first time^)...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install ناموفق بود.
    pause
    exit /b 1
  )
) else (
  echo node_modules موجود است — نصب کامل رد شد.
)

echo.
echo Starting Next.js on http://localhost:3000
echo API target: http://localhost:8000
echo ============================================
call npm run dev
if errorlevel 1 (
  echo.
  echo [ERROR] Next.js استارت نشد.
  pause
)