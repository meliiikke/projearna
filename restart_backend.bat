@echo off
echo Stopping backend server...
taskkill /f /im node.exe 2>nul
echo Starting backend server...
cd backend
npm start
pause
