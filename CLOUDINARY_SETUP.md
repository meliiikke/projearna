# Cloudinary Kurulum Rehberi

## 1. Cloudinary Hesabı Oluşturma
1. [Cloudinary.com](https://cloudinary.com) adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'dan API bilgilerinizi alın

## 2. Railway Environment Variables
Railway dashboard'da aşağıdaki environment variable'ları ekleyin:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3. Cloudinary Dashboard Ayarları
- **Upload Preset**: Unsigned upload preset oluşturun
- **Folder**: `projearna_uploads` (otomatik oluşturulacak)
- **Allowed Formats**: jpg, jpeg, png, webp, gif, avif
- **Max File Size**: 10MB

## 4. Test Etme
Backend çalıştıktan sonra:
```
GET https://your-railway-url/api/debug
```

Bu endpoint Cloudinary konfigürasyonunu kontrol eder.

## 5. Sorun Giderme
- Environment variable'ların doğru set edildiğini kontrol edin
- Cloudinary dashboard'da API key'lerin aktif olduğunu kontrol edin
- Railway logs'ları kontrol edin
