# Admin Login Sorunu Çözümü

## Sorun
Admin login'de "Login failed" hatası alınıyor.

## Çözüm Adımları

### 1. Database Kurulumu
```sql
-- database_content_setup.sql dosyasını phpMyAdmin'de çalıştırın
-- Bu dosya artık admin kullanıcısını otomatik oluşturacak
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
npm start
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```

### 4. Test Etme
```bash
# Backend klasöründe
node test_admin_login.js
```

## Default Admin Bilgileri
- **Username:** admin
- **Password:** admin123
- **Email:** admin@arnaenergy.com

## Yapılan Değişiklikler

### Backend
- ✅ Database initialization'da admin kullanıcısı otomatik oluşturuluyor
- ✅ CORS ayarları production için güncellendi
- ✅ JWT secret güvenli hale getirildi
- ✅ Environment variable'lar için default değerler eklendi

### Frontend
- ✅ API base URL production için düzeltildi
- ✅ AuthContext'te API base URL kullanılıyor
- ✅ Development için proxy eklendi

### Database
- ✅ Admin tablosu için default kullanıcı eklendi
- ✅ Password hash'lenmiş olarak saklanıyor

## Production Deployment

### Railway Backend
- Environment variables ekleyin:
  - `DB_HOST`
  - `DB_PORT` 
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `JWT_SECRET`
  - `NODE_ENV=production`

### Railway Frontend
- Environment variables ekleyin:
  - `REACT_APP_API_BASE_URL=https://your-backend-url.railway.app/api`

## Sorun Giderme

### 1. Database Bağlantı Hatası
- XAMPP/MySQL çalışıyor mu kontrol edin
- Database credentials doğru mu kontrol edin
- Database oluşturulmuş mu kontrol edin

### 2. CORS Hatası
- Backend CORS ayarları doğru mu kontrol edin
- Frontend URL'i backend CORS listesinde mi kontrol edin

### 3. JWT Hatası
- JWT_SECRET environment variable set edilmiş mi kontrol edin
- Token expiration süresi kontrol edin

### 4. Admin Kullanıcısı Yok
- Database'de admins tablosu var mı kontrol edin
- Admin kullanıcısı oluşturulmuş mu kontrol edin

## Test Komutları

```bash
# Backend health check
curl http://localhost:3001/api/health

# Admin login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Log Kontrolü
Backend console'da şu mesajları görmelisiniz:
- ✅ Database initialized successfully
- ✅ Default admin user created: username=admin, password=admin123
- 🚀 ARNA Energy Backend Server running on port 3001
