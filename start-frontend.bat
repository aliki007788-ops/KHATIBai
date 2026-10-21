@echo off
chcp 65001 >nul
title Frontend - خطیب
cd /d "%~dp0frontend"

if not exist .env.local (
    echo Creating .env.local...
    echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000> .env.local
)

echo Installing packages...
call npm install

echo.
echo Starting Next.js on http://localhost:3000
echo ============================================
call npm run dev

pause