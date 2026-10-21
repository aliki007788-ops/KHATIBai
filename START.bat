@echo off
chcp 65001 >nul
title خطیب V1

echo ============================================
echo   خطیب V1 - Starting Frontend + Backend
echo ============================================
echo.

set "ROOT=%~dp0"

echo [1/2] Starting Backend (port 8000)...
start "Backend-8000" cmd /k "%ROOT%start-backend.bat"

timeout /t 6 /nobreak >nul

echo [2/2] Starting Frontend (port 3000)...
start "Frontend-3000" cmd /k "%ROOT%start-frontend.bat"

echo.
echo ============================================
echo   Services are starting...
echo ============================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   Waiting 12 seconds then opening browser...
timeout /t 12 /nobreak >nul

start http://localhost:3000

echo.
echo Done. You can close this window.
pause