@echo off
REM Hybrid Messaging System - Quick Start Script (Windows)
REM This script starts both backend and frontend servers

echo.
echo 🚀 Starting Campus Gigs Messaging System...
echo.

REM Check if in correct directory
if not exist "BackEnd\" (
    echo ❌ Error: Please run this script from the Campus directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "FrontEnd\" (
    echo ❌ Error: Please run this script from the Campus directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Start Backend Server
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd BackEnd && npm start"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start Frontend Server
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd FrontEnd && npm run dev"

echo.
echo ✅ Servers starting!
echo.
echo 📡 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:5173
echo 🔌 WebSocket: ws://localhost:5000
echo.
echo 📖 See MESSAGING_SYSTEM_GUIDE.md for usage instructions
echo.
echo Close the terminal windows to stop the servers
echo.
pause
