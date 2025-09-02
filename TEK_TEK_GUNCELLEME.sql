-- MySQL Workbench Safe Mode ile uyumlu - Tek tek güncelleme
-- Bu script güvenlik modunda da çalışır

-- Önce mevcut eski URL'leri görelim
SELECT id, title, image_url 
FROM hero_slides 
WHERE image_url LIKE '/uploads/%' 
   OR image_url LIKE 'img-%' 
   OR image_url LIKE '%img-%'
   OR image_url LIKE '%uploads%'
   OR image_url LIKE '%img-1756%'
   OR image_url LIKE '%175667%'
   OR image_url LIKE '%175672%'
   OR image_url LIKE '%175673%'
   OR image_url LIKE '%175680%';

-- Tek tek güncelleme (güvenlik modu ile uyumlu)
-- Her satırı ayrı ayrı çalıştırın

-- Örnek 1: ID 1'deki eski URL'i NULL yap
UPDATE hero_slides 
SET image_url = NULL 
WHERE id = 1 AND (image_url LIKE '/uploads/%' OR image_url LIKE 'img-%');

-- Örnek 2: ID 2'deki eski URL'i NULL yap
UPDATE hero_slides 
SET image_url = NULL 
WHERE id = 2 AND (image_url LIKE '/uploads/%' OR image_url LIKE 'img-%');

-- Örnek 3: ID 3'teki eski URL'i NULL yap
UPDATE hero_slides 
SET image_url = NULL 
WHERE id = 3 AND (image_url LIKE '/uploads/%' OR image_url LIKE 'img-%');

-- Daha fazla ID varsa aynı pattern'i kullanın
-- Önce SELECT ile ID'leri bulun, sonra her birini ayrı ayrı güncelleyin

-- Sonuçları kontrol et
SELECT id, title, image_url 
FROM hero_slides 
WHERE image_url IS NOT NULL;
