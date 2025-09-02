@echo off
title ARNA Backend Restart - URGENT
echo.
echo ========================================
echo    ARNA Backend Restart - URGENT
echo ========================================
echo.
echo Stopping any running backend processes...
taskkill /f /im node.exe 2>nul
echo.
echo Starting backend server...
cd backend
npm start
echo.
echo Backend server started!
echo Check the console for CORS logs.
pause
