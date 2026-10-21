@echo off
chcp 65001 >nul
title خطیب V1 - Stopping...

echo ============================================
echo   خطیب V1 - Stopping all services
echo ============================================
echo.

echo Closing Backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Closing Frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Closing related windows...
taskkill /FI "WINDOWTITLE eq Backend-8000*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend-3000*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend - خطیب*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend - خطیب*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq next-server*" /F >nul 2>&1

echo.
echo ============================================
echo   All services stopped.
echo ============================================
echo.
pause