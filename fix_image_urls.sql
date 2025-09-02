-- Quick fix for CORS errors - Set old image URLs to NULL
-- This will prevent the frontend from trying to load non-existent images

-- Update hero slides with old image URLs to NULL
UPDATE hero_slides 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';

-- Update content sections with old image URLs to NULL  
UPDATE content_sections 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';

-- Update services with old image URLs to NULL
UPDATE services 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';

-- Check the results
SELECT 'hero_slides' as table_name, id, title, image_url FROM hero_slides WHERE image_url IS NOT NULL
UNION ALL
SELECT 'content_sections' as table_name, id, title, image_url FROM content_sections WHERE image_url IS NOT NULL  
UNION ALL
SELECT 'services' as table_name, id, title, image_url FROM services WHERE image_url IS NOT NULL;
