Write-Host "🚀 Starting ARNA Energy Backend Server..." -ForegroundColor Green
Write-Host "📁 Changing to backend directory..." -ForegroundColor Yellow

Set-Location backend

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔄 Starting server..." -ForegroundColor Yellow
npm start
