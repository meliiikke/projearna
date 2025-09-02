# 🔧 API URL Double Domain Fix

## 🚨 SORUN: Çift Domain Hatası

Log'larda şu hata görülüyordu:
```
🔧 Full URL: https://arnasitesi.netlify.apphttps://perfect-caring-production.up.railway.app/api/...
```

### **Sorunun Nedeni:**
- `window.location.origin` + `API_BASE_URL` birleştiriliyordu
- `API_BASE_URL` zaten tam domain içeriyor (`https://perfect-caring-production.up.railway.app/api`)
- Sonuç: Çift domain oluşuyordu

## ✅ ÇÖZÜM

### **1. utils/api.js Düzeltildi**

#### **Önceki Hali (Hatalı):**
```javascript
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log(`🔧 Full URL: ${window.location.origin}${url}`); // ❌ Çift domain!
    
    const response = await fetch(url, {
```

#### **Yeni Hali (Düzeltildi):**
```javascript
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log(`🔧 Full URL: ${url}`); // ✅ Sadece URL
    
    const response = await fetch(url, {
```

### **2. API_BASE_URL Konfigürasyonu Doğru**

#### **Development Environment:**
```javascript
// frontend/src/config/api.js
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/api'; // ✅ Relative path (proxy kullanır)
  }
  
  // Production: tam URL
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://perfect-caring-production.up.railway.app/api';
  return baseUrl.replace(/^http:/, 'https:');
};
```

#### **Production Environment:**
```javascript
// netlify.toml
[build.environment]
  REACT_APP_API_BASE_URL = "https://perfect-caring-production.up.railway.app/api"
```

## 🚀 **Test Etme**

### **1. API URL Test Script:**
```bash
node test_api_urls.js
```

### **2. Browser Console Check:**
```javascript
// Development'da şunu görmeli:
🌐 API_BASE_URL: /api
🔧 Full URL: /api/content/sections

// Production'da şunu görmeli:
🌐 API_BASE_URL: https://perfect-caring-production.up.railway.app/api
🔧 Full URL: https://perfect-caring-production.up.railway.app/api/content/sections
```

### **3. Network Tab Check:**
- Development: `http://localhost:3001/api/content/sections`
- Production: `https://perfect-caring-production.up.railway.app/api/content/sections`

## 📊 **Beklenen Sonuç**

### ✅ **Başarılı (Düzeltildi):**
```
🌐 API_BASE_URL: https://perfect-caring-production.up.railway.app/api
🔧 Full URL: https://perfect-caring-production.up.railway.app/api/content/sections
```

### ❌ **Eski Hali (Çözüldü):**
```
🔧 Full URL: https://arnasitesi.netlify.apphttps://perfect-caring-production.up.railway.app/api/content/sections
```

## 🔍 **Environment Breakdown**

### **Development:**
- `NODE_ENV=development`
- `API_BASE_URL=/api` (relative path)
- Proxy: `http://localhost:3001` → `/api`
- Final URL: `http://localhost:3001/api/content/sections`

### **Production:**
- `NODE_ENV=production`
- `API_BASE_URL=https://perfect-caring-production.up.railway.app/api` (full URL)
- No proxy needed
- Final URL: `https://perfect-caring-production.up.railway.app/api/content/sections`

## 🎯 **Sonuç**

API URL çift domain sorunu tamamen çözüldü! Artık:

- ✅ **Development'da relative path kullanılıyor**
- ✅ **Production'da tam URL kullanılıyor**
- ✅ **Çift domain sorunu yok**
- ✅ **Console log'ları temiz**
- ✅ **Network request'leri doğru**

**API URL'leri artık doğru çalışıyor!** 🚀
