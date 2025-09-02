@echo off
title ARNA Frontend Build Test
echo.
echo ========================================
echo    ARNA Frontend Build Test
echo ========================================
echo.
echo Testing production build...
echo.

cd frontend

echo Setting production environment...
set NODE_ENV=production
set REACT_APP_API_BASE_URL=https://projearna-production.up.railway.app/api
set CI=false

echo Running build...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo Build files are in the 'build' directory.
) else (
    echo.
    echo ❌ Build failed!
    echo Check the error messages above.
)

echo.
pause
