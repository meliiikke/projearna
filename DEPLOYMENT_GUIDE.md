# Projearna Deployment Rehberi

## 🚀 Railway Backend Deployment

### 1. Railway'de Proje Oluşturma
1. [Railway.app](https://railway.app) hesabınıza giriş yapın
2. "New Project" → "Deploy from GitHub repo" seçin
3. Bu repository'yi seçin
4. Backend klasörünü seçin

### 2. Environment Variables (Railway Dashboard)
Railway dashboard'da aşağıdaki environment variable'ları ekleyin:

```bash
# Database (Railway MySQL addon kullanıyorsanız)
DB_HOST=your_railway_mysql_host
DB_USER=your_railway_mysql_user
DB_PASSWORD=your_railway_mysql_password
DB_NAME=your_railway_mysql_database

# JWT Secret
JWT_SECRET=your_strong_jwt_secret_here

# Cloudinary (ZORUNLU - Resim yükleme için)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server
NODE_ENV=production
PORT=3001
```

### 3. Railway Konfigürasyonu
- `railway.json` dosyası zaten hazır
- `Procfile` dosyası zaten hazır
- Health check: `/api/health`

## 🌐 Netlify Frontend Deployment

### 1. Netlify'de Site Oluşturma
1. [Netlify.com](https://netlify.com) hesabınıza giriş yapın
2. "New site from Git" → GitHub repository seçin
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Base directory**: `frontend`

### 2. Environment Variables (Netlify Dashboard)
Netlify dashboard'da aşağıdaki environment variable'ı ekleyin:

```bash
REACT_APP_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
```

### 3. Netlify Konfigürasyonu
- `netlify.toml` dosyası zaten hazır
- `_redirects` dosyası zaten hazır

## 🔧 Cloudinary Kurulumu

### 1. Cloudinary Hesabı
1. [Cloudinary.com](https://cloudinary.com) ücretsiz hesap oluşturun
2. Dashboard'dan API bilgilerinizi alın

### 2. Cloudinary Ayarları
- **Upload Preset**: Unsigned upload preset oluşturun
- **Folder**: `projearna_uploads` (otomatik oluşturulacak)
- **Allowed Formats**: jpg, jpeg, png, webp, gif, avif
- **Max File Size**: 10MB

## ✅ Test Etme

### Backend Test
```bash
# Health check
GET https://your-railway-url/api/health

# Cloudinary debug
GET https://your-railway-url/api/debug

# Cloudinary test
GET https://your-railway-url/api/test-cloudinary
```

### Frontend Test
1. Netlify URL'nizi açın
2. Admin paneline giriş yapın (admin/admin123)
3. Resim yükleme test edin

## 🐛 Sorun Giderme

### Resim Yükleme Sorunları
1. Cloudinary environment variable'larını kontrol edin
2. Railway logs'ları kontrol edin
3. `/api/debug` endpoint'ini test edin

### CORS Sorunları
- Backend'de CORS ayarları zaten yapılandırılmış
- Railway ve Netlify URL'lerini kontrol edin

### Database Sorunları
- Railway MySQL addon kullanıyorsanız connection string'i kontrol edin
- Database migration'ları çalıştırın

## 📝 Önemli Notlar

1. **HTTPS Zorunlu**: Production'da tüm URL'ler HTTPS olmalı
2. **Environment Variables**: Railway ve Netlify'de doğru set edilmeli
3. **Cloudinary**: Resim yükleme için mutlaka gerekli
4. **Database**: Railway MySQL addon veya external database kullanın

## 🔗 URL'ler

- **Backend**: `https://projearna-production.up.railway.app`
- **Frontend**: `https://your-netlify-site.netlify.app`
- **Admin Panel**: `https://your-netlify-site.netlify.app/admin`
