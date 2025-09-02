-- Eski resim URL'lerini temizleme scripti
-- Bu script hero_slides tablosundaki eski local image URL'lerini NULL yapar

-- Önce mevcut durumu kontrol et
SELECT 
    id, 
    title, 
    image_url,
    CASE 
        WHEN image_url LIKE '/uploads/%' THEN 'ESKI_LOCAL_URL'
        WHEN image_url LIKE '%img-%' THEN 'ESKI_IMG_PATTERN'
        WHEN image_url LIKE '%cloudinary.com%' THEN 'CLOUDINARY_URL'
        WHEN image_url IS NULL THEN 'NULL'
        ELSE 'DIGER'
    END as url_type
FROM hero_slides 
ORDER BY id;

-- Eski local URL'leri temizle
UPDATE hero_slides 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads/%'
   OR image_url REGEXP 'img-[0-9]+-[0-9]+\\.(jpg|jpeg|png|webp|gif)'
   OR image_url REGEXP 'img-[0-9]+\\.(jpg|jpeg|png|webp|gif)';

-- Temizlik sonrası durumu kontrol et
SELECT 
    id, 
    title, 
    image_url,
    CASE 
        WHEN image_url LIKE '%cloudinary.com%' THEN 'CLOUDINARY_URL'
        WHEN image_url IS NULL THEN 'NULL'
        ELSE 'DIGER'
    END as url_type
FROM hero_slides 
ORDER BY id;

-- Temizlenen kayıt sayısını göster
SELECT 
    COUNT(*) as toplam_kayit,
    SUM(CASE WHEN image_url IS NULL THEN 1 ELSE 0 END) as null_url_sayisi,
    SUM(CASE WHEN image_url LIKE '%cloudinary.com%' THEN 1 ELSE 0 END) as cloudinary_url_sayisi
FROM hero_slides;
