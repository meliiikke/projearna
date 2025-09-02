-- Migration: Add value column to about_stats table
-- This script adds the missing 'value' column to the about_stats table

-- Add value column if it doesn't exist
ALTER TABLE about_stats 
ADD COLUMN IF NOT EXISTS value VARCHAR(50) DEFAULT NULL AFTER title;

-- Update existing data with default values
UPDATE about_stats 
SET value = '2009' 
WHERE title = 'Why We Are Oil & Gas Company' AND (value IS NULL OR value = '');

-- Insert some sample data if table is empty
INSERT IGNORE INTO about_stats (title, value, icon, is_active) VALUES
('YILLINDAN BERİ', '2009', '⚡', 1),
('ÜLKEDE FAALİYET', '60', '🌍', 1),
('ÜRÜN SAYISI', '500+', '📦', 1);
