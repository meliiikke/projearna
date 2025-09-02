-- MySQL Workbench Safe Mode ile uyumlu temizleme script'i
-- Bu script güvenlik modunda da çalışır

-- Önce mevcut eski URL'leri görelim
SELECT 'hero_slides' as table_name, id, title, image_url 
FROM hero_slides 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%'

UNION ALL

SELECT 'content_sections' as table_name, id, title, image_url 
FROM content_sections 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%'

UNION ALL

SELECT 'services' as table_name, id, title, image_url 
FROM services 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%';

-- Güvenlik modu ile uyumlu güncellemeler (ID ile)
UPDATE hero_slides 
SET image_url = NULL 
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM hero_slides 
        WHERE image_url LIKE '/uploads/%' 
           OR image_url LIKE 'img-%' 
           OR image_url LIKE '%img-%'
           OR image_url LIKE '%uploads%'
           OR image_url LIKE '%img-1756%'
           OR image_url LIKE '%175667%'
           OR image_url LIKE '%175672%'
           OR image_url LIKE '%175673%'
           OR image_url LIKE '%175680%'
    ) AS temp
);

UPDATE content_sections 
SET image_url = NULL 
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM content_sections 
        WHERE image_url LIKE '/uploads/%' 
           OR image_url LIKE 'img-%' 
           OR image_url LIKE '%img-%'
           OR image_url LIKE '%uploads%'
           OR image_url LIKE '%img-1756%'
           OR image_url LIKE '%175667%'
           OR image_url LIKE '%175672%'
           OR image_url LIKE '%175673%'
           OR image_url LIKE '%175680%'
    ) AS temp
);

UPDATE services 
SET image_url = NULL 
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM services 
        WHERE image_url LIKE '/uploads/%' 
           OR image_url LIKE 'img-%' 
           OR image_url LIKE '%img-%'
           OR image_url LIKE '%uploads%'
           OR image_url LIKE '%img-1756%'
           OR image_url LIKE '%175667%'
           OR image_url LIKE '%175672%'
           OR image_url LIKE '%175673%'
           OR image_url LIKE '%175680%'
    ) AS temp
);

-- Sonuçları kontrol et
SELECT 'hero_slides' as table_name, id, title, image_url 
FROM hero_slides 
WHERE image_url IS NOT NULL

UNION ALL

SELECT 'content_sections' as table_name, id, title, image_url 
FROM content_sections 
WHERE image_url IS NOT NULL

UNION ALL

SELECT 'services' as table_name, id, title, image_url 
FROM services 
WHERE image_url IS NOT NULL;
