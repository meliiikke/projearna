-- Migration: Add map coordinates to contact_info table
-- This script adds map_lat and map_lng fields to the contact_info table

-- Insert map coordinates if they don't exist
INSERT IGNORE INTO contact_info (field_name, field_value) VALUES
('map_lat', '41.0781'),
('map_lng', '29.0173');

-- Update existing coordinates if they exist but are empty
UPDATE contact_info 
SET field_value = '41.0781' 
WHERE field_name = 'map_lat' AND (field_value IS NULL OR field_value = '');

UPDATE contact_info 
SET field_value = '29.0173' 
WHERE field_name = 'map_lng' AND (field_value IS NULL OR field_value = '');
