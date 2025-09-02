-- Hızlı veritabanı temizliği
-- Eski local image URL'lerini NULL yap

UPDATE hero_slides 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads/%';

-- Temizlik sonrası kontrol
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
