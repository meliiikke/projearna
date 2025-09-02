@echo off
echo Building ARNA Energy Project...

echo.
echo Building Backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo Backend build failed!
    pause
    exit /b 1
)

echo.
echo Building Frontend...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo Next steps:
echo 1. Deploy backend to Railway
echo 2. Deploy frontend to Netlify
echo 3. Configure Cloudinary environment variables
echo.
pause
