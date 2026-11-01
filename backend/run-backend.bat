@echo off
cd /d C:\Users\K.ali\Desktop\khatib-full-v1\backend
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0