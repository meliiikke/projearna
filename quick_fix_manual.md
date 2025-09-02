# Hızlı Manuel Çözüm

## 1. Eski Resimleri Kontrol Et
phpMyAdmin'de bu sorguyu çalıştır:
```sql
SELECT 'hero_slides' as table_name, id, title, image_url FROM hero_slides WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'
UNION ALL
SELECT 'content_sections' as table_name, id, title, image_url FROM content_sections WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'
UNION ALL
SELECT 'services' as table_name, id, title, image_url FROM services WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';
```

## 2. Admin Panelinden Yeniden Yükle
- Admin paneline git
- Her bir eski resim için:
  - Yeni resim yükle (Cloudinary'ye gidecek)
  - Eski URL'yi yeni Cloudinary URL ile değiştir

## 3. Eski URL'leri Temizle
```sql
-- Yüklenemeyen eski URL'leri NULL yap
UPDATE hero_slides SET image_url = NULL WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';
UPDATE content_sections SET image_url = NULL WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';
UPDATE services SET image_url = NULL WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';
```

## 4. Test Et
- Frontend'i yenile
- CORS hatalarının kaybolduğunu kontrol et
