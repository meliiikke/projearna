@echo off
echo XAMPP ARNA Energy Website Baslatiliyor...
echo.

echo 1. XAMPP MySQL servisinin calistigini kontrol edin
echo 2. phpMyAdmin'de davut_titrading veritabaninin oldugunu kontrol edin
echo.

cd backend
echo Backend baslatiliyor...
start "Backend Server" cmd /k "npm run dev"

timeout /t 3

cd ../frontend
echo Frontend baslatiliyor...
start "Frontend Server" cmd /k "npm start"

echo.
echo Proje baslatildi!
echo Website: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin/login
echo Backend API: http://localhost:3001
echo.
echo Admin Giris Bilgileri:
echo Kullanici Adi: admin
echo Sifre: admin123
echo.
pause
