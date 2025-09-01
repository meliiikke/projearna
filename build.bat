@echo off
echo 🚀 Starting ARNA Energy Build Process...

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    exit /b 1
)
echo ✅ Backend dependencies installed successfully

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully

REM Build frontend
echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)
echo ✅ Frontend build completed successfully

REM Go back to root
cd ..

echo 🎉 Build process completed successfully!
echo 📁 Frontend build output: frontend\build\
echo 🚀 Backend ready to start: cd backend ^&^& npm start

pause
