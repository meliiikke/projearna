@echo off
title ARNA Energy - Full Stack
echo.
echo ========================================
echo    ARNA Energy - Full Stack
echo ========================================
echo.
echo Starting both backend and frontend...
echo.

echo Starting Backend Server (Port 3001)...
start "ARNA Backend" cmd /k "cd backend && node server.js"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (Port 3000)...
start "ARNA Frontend" cmd /k "cd frontend && set NODE_ENV=development && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
