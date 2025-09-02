@echo off
title ARNA Backend Server
echo.
echo ========================================
echo    ARNA Energy Backend Server
echo ========================================
echo.
echo Starting backend server on port 3001...
echo.
cd backend
node server.js
echo.
echo Backend server stopped.
pause
