@echo off
title ARNA Frontend
echo.
echo ========================================
echo    ARNA Energy Frontend
echo ========================================
echo.
echo Starting frontend on port 3000...
echo Make sure backend is running on port 3001!
echo.
cd frontend
set NODE_ENV=development
npm start
echo.
echo Frontend stopped.
pause
