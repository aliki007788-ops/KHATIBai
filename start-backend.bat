@echo off
chcp 65001 >nul
title Backend - خطیب
cd /d "%~dp0backend"

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt -q

if not exist .env (
    echo Creating .env file...
    copy .env.example .env >nul
)

echo.
echo Starting FastAPI on http://localhost:8000
echo ============================================
uvicorn app.main:app --reload --port 8000

pause