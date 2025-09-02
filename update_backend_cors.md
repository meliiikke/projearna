# 🔧 Backend CORS Güncelleme

## 🚨 ÖNEMLİ: Backend'inizde CORS ayarlarını güncellemeniz gerekiyor!

### Backend URL'niz:
```
https://perfect-caring-production.up.railway.app/api
```

### Frontend URL'niz:
```
https://arnasitesi.netlify.app
```

## 🔧 Backend'de Yapılması Gerekenler:

### 1. **server.js'de CORS Konfigürasyonu**
```javascript
// CORS whitelist
const allowedOrigins = [
  'http://localhost:3000',
  'https://arnasitesi.netlify.app'  // Bu satırı ekleyin
];

// CORS konfigürasyonu - PRODUCTION İÇİN
app.use(cors({
    origin: function (origin, callback) {
      // Production'da sadece Netlify domain'ine izin ver
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
  }));

// Pre-flight OPTIONS handler - PRODUCTION
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
```

### 2. **Backend'i Deploy Et**
```bash
git add .
git commit -m "Update CORS for arnasitesi.netlify.app"
git push origin main
```

## 🚀 Test Etme

### 1. **Backend Health Check**
```bash
curl https://perfect-caring-production.up.railway.app/api/health
```

### 2. **CORS Test**
```bash
curl -X OPTIONS \
  -H "Origin: https://arnasitesi.netlify.app" \
  -H "Access-Control-Request-Method: GET" \
  https://perfect-caring-production.up.railway.app/api/content/hero-features
```

## 📊 Beklenen Sonuç

### ✅ Başarılı CORS
```
Access-Control-Allow-Origin: https://arnasitesi.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-auth-token
Access-Control-Allow-Credentials: true
```

## 🎯 Sonuç

Backend'inizde CORS ayarlarını güncelledikten sonra:

- ✅ **Frontend'den backend'e istekler başarılı olacak**
- ✅ **Admin panel çalışacak**
- ✅ **İçerikler görünecek**
- ✅ **CRUD işlemleri çalışacak**

**Backend'inizi güncelleyin ve deploy edin!** 🚀
