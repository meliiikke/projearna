@echo off
title ARNA Backend Production Deploy
echo.
echo ========================================
echo    ARNA Backend Production Deploy
echo ========================================
echo.
echo 1. Backend kodlarını Railway'e push ediliyor...
echo.
cd backend
git add .
git commit -m "Fix CORS for production - admin panel and content display"
git push origin main
echo.
echo 2. Railway'de backend restart ediliyor...
echo.
echo Backend deploy tamamlandı!
echo.
echo Test etmek için:
echo https://projearna-production.up.railway.app/api/health
echo.
pause
