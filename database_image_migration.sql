-- Database Image URL Migration Script
-- This script updates old local image URLs to Cloudinary URLs
-- Run this in phpMyAdmin or your MySQL client

-- First, let's see what old image URLs we have
SELECT id, title, image_url FROM hero_slides WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';

-- Update hero slides with old image URLs
-- Note: You'll need to replace these with actual Cloudinary URLs
-- You can get these from your Cloudinary dashboard or by uploading the images again

-- Example updates (replace with your actual Cloudinary URLs):
-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756671282976-15277791.jpeg';

-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756671380633-727647821.jpg';

-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756728674250-275591629.webp';

-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756728705752-918789462.png';

-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756731341341-432670628.jpg';

-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756731392930-382448862.jpg';

-- UPDATE hero_slides 
-- SET image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/projearna_uploads/your-image-name.jpg'
-- WHERE image_url = '/uploads/img-1756739446249-495402031.jpg';

-- For now, let's set all old image URLs to NULL so they don't cause CORS errors
UPDATE hero_slides 
SET image_url = NULL 
WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%';

-- Check the results
SELECT id, title, image_url FROM hero_slides;
