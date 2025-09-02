-- Eski resim URL'lerini kontrol et
SELECT 'hero_slides' as table_name, id, title, image_url FROM hero_slides WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'
UNION ALL
SELECT 'content_sections' as table_name, id, title, image_url FROM content_sections WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'
UNION ALL
SELECT 'services' as table_name, id, title, image_url FROM services WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';
