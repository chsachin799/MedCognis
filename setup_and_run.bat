@echo off
setlocal
title MedCognis Setup & Run

echo ==========================================
echo       MedCognis Health - Auto Setup
echo ==========================================

cd /d "%~dp0"

:: 1. Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ and try again.
    pause
    exit /b
)
echo [OK] Python found.

:: 2. Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js v18+ and try again.
    pause
    exit /b
)
echo [OK] Node.js found.

:: 3. Backend Setup
echo.
echo [1/4] Setting up Backend...
cd Models

if not exist ".venv" (
    echo     - Creating virtual environment...
    python -m venv .venv
)

echo     - Activating virtual environment...
call .venv\Scripts\activate

if exist "requirements.txt" (
    echo     - Installing backend dependencies...
    pip install -r requirements.txt
) else (
    echo [WARNING] requirements.txt not found in Models directory!
)

:: 4. Frontend Setup
echo.
echo [2/4] Setting up Frontend...
cd ..
if not exist "node_modules" (
    echo     - Installing frontend dependencies (this may take a while)...
    call npm install
) else (
    echo     - Frontend dependencies already installed.
)

:: 5. Launch Application
echo.
echo [3/4] Launching Backend Server...
start "MedCognis Backend" cmd /k "cd /d %~dp0Models && .venv\Scripts\activate && python app.py"

echo [4/4] Launching Frontend Server...
start "MedCognis Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ==========================================
echo       MedCognis is starting up!
echo ==========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Opening application in browser...
timeout /t 5 >nul
start http://localhost:3000

echo.
echo Keep this window open or close it to manage processes manually.
pause
