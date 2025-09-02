-- ACİL VERİTABANI TEMİZLİK - Bu script'i hemen çalıştırın!

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
   OR image_url LIKE '%1756804%'

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
   OR image_url LIKE '%1756804%'

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
   OR image_url LIKE '%175680%'
   OR image_url LIKE '%1756804%';

-- Şimdi tüm eski URL'leri NULL yap
UPDATE hero_slides 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%'
   OR image_url LIKE '%1756804%';

UPDATE content_sections 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%'
   OR image_url LIKE '%1756804%';

UPDATE services 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%'
   OR image_url LIKE '%1756804%';

-- Sonuçları kontrol et - artık eski URL olmamalı
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
