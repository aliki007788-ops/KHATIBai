@echo off
chcp 65001 >nul
title خطیب - Start

echo ============================================
echo   خطیب - Frontend + Backend
echo ============================================
echo.

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo [0/3] توقف سرویس‌های قبلی و آزاد کردن پورت‌ها...
call "%ROOT%STOP.bat"

echo.
echo [1/3] شروع Backend روی پورت 8000...
start "Backend-8000" cmd /k "%ROOT%start-backend.bat"

echo     صبر برای بالا آمدن Backend...
timeout /t 8 /nobreak >nul

echo [2/3] شروع Frontend روی پورت 3000...
start "Frontend-3000" cmd /k "%ROOT%start-frontend.bat"

echo [3/3] صبر برای Ready شدن Next.js...
timeout /t 15 /nobreak >nul

echo.
echo ============================================
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Frontend: http://localhost:3000
echo ============================================
echo.
echo در حال باز کردن مرورگر...
start http://localhost:3000/login

echo.
echo دو پنجره Backend و Frontend را باز نگه دار.
echo برای توقف: STOP.bat را اجرا کن.
echo.
pause