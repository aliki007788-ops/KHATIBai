@echo off
chcp 65001 >nul
title خطیب - توقف سرویس‌ها

echo ============================================
echo   خطیب - Stopping all services
echo ============================================
echo.

echo [1] آزاد کردن پورت 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
  echo   kill PID %%a
  taskkill /F /PID %%a >nul 2>&1
)

echo [2] آزاد کردن پورت 3000 / 3001 / 3002 (Frontend)...
for %%P in (3000 3001 3002) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P" ^| findstr "LISTENING"') do (
    echo   kill PID %%a on port %%P
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo [3] بستن پنجره‌های قبلی...
taskkill /FI "WINDOWTITLE eq Backend-8000*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend-3000*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend - خطیب*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend - خطیب*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq next-server*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq خطیب V1*" /F >nul 2>&1

echo.
echo ============================================
echo   تمام شد. پورت‌ها آزاد هستند.
echo ============================================
echo.
timeout /t 2 /nobreak >nul