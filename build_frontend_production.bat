@echo off
title ARNA Frontend Production Build
echo.
echo ========================================
echo    ARNA Frontend Production Build
echo ========================================
echo.
echo 1. Production environment ayarlanıyor...
set NODE_ENV=production
set REACT_APP_API_BASE_URL=https://perfect-caring-production.up.railway.app/api
echo.
echo 2. Frontend build ediliyor...
cd frontend
npm run build
echo.
echo 3. Build tamamlandı!
echo Build dosyaları: frontend/build/
echo.
echo 4. Netlify'ye deploy etmek için:
echo - Build klasörünü Netlify'ye upload et
echo - Veya git push yap
echo.
pause
