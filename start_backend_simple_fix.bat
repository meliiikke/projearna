@echo off
title ARNA Backend - Simple Fix
echo.
echo ========================================
echo    ARNA Backend - Simple Fix
echo ========================================
echo.
echo Starting backend server...
cd backend
npm start
echo.
echo Backend server started!
echo Check if it's working at: http://localhost:3001/api/health
pause
