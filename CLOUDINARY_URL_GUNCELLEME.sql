-- En Kolay Çözüm: Eski URL'leri Cloudinary URL'leri ile değiştir
-- Bu şekilde uploads klasöründeki dosyalar kalsa bile kullanılmaz

-- Önce mevcut eski URL'leri görelim
SELECT 'hero_slides' as table_name, id, title, image_url 
FROM hero_slides 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%';

-- Örnek: Eski URL'leri Cloudinary URL'leri ile değiştir
-- Bu örnekleri kendi Cloudinary URL'lerinizle değiştirin

-- Hero slides için örnek güncelleme
UPDATE hero_slides 
SET image_url = 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/projearna_uploads/hero-slide-1.jpg'
WHERE image_url = '/uploads/img-1756671282976-15277791.jpeg';

UPDATE hero_slides 
SET image_url = 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/projearna_uploads/hero-slide-2.jpg'
WHERE image_url = '/uploads/img-1756671347865-922774216.png';

-- Daha fazla güncelleme için aynı pattern'i kullanın
-- Sadece YOUR_CLOUD_NAME ve dosya adlarını değiştirin

-- Sonuçları kontrol et
SELECT 'hero_slides' as table_name, id, title, image_url 
FROM hero_slides 
WHERE image_url IS NOT NULL;
