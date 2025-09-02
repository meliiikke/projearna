const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Helper function to clean image URLs
const cleanImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a Cloudinary URL, return as is
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // If it's an old local path or contains old image patterns, return null to prevent CORS errors
  if (imageUrl.startsWith('/uploads/') || 
      imageUrl.includes('img-') || 
      imageUrl.includes('uploads/') ||
      imageUrl.match(/img-\d+-\d+\.(jpg|jpeg|png|webp|gif)/i)) {
    console.warn('Old image URL detected, returning null:', imageUrl);
    return null;
  }
  
  return imageUrl;
};

// Get all hero slides (public)
router.get('/slides', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY slide_order ASC, created_at ASC'
    );
    
    // Clean image URLs to prevent CORS errors
    const cleanedRows = rows.map(slide => ({
      ...slide,
      image_url: cleanImageUrl(slide.image_url)
    }));
    
    res.json(cleanedRows);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ message: 'Error fetching hero slides' });
  }
});

// Get all hero slides for admin
router.get('/admin/hero-slides', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM hero_slides ORDER BY slide_order ASC, created_at ASC'
    );
    
    // Clean image URLs to prevent CORS errors
    const cleanedRows = rows.map(slide => ({
      ...slide,
      image_url: cleanImageUrl(slide.image_url)
    }));
    
    res.json(cleanedRows);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ message: 'Error fetching hero slides' });
  }
});

// Get single hero slide
router.get('/admin/hero-slides/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM hero_slides WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    // Clean image URL to prevent CORS errors
    const slide = {
      ...rows[0],
      image_url: cleanImageUrl(rows[0].image_url)
    };

    res.json(slide);
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    res.status(500).json({ message: 'Error fetching hero slide' });
  }
});

// Create new hero slide
router.post('/admin/hero-slides', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      content,
      image_url,
      button_text,
      button_link,
      slide_order,
      is_active,
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO hero_slides 
       (title, subtitle, content, image_url, button_text, button_link, slide_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || '',
        subtitle || '',
        content || '',
        image_url || '',
        button_text || '',
        button_link || '',
        slide_order || 0,
        is_active !== undefined ? is_active : true,
      ]
    );

    const [newSlide] = await pool.execute('SELECT * FROM hero_slides WHERE id = ?', [
      result.insertId,
    ]);

    // Clean image URL to prevent CORS errors
    const slide = {
      ...newSlide[0],
      image_url: cleanImageUrl(newSlide[0].image_url)
    };

    res.status(201).json({
      message: 'Hero slide created successfully',
      slide: slide,
    });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({ message: 'Error creating hero slide' });
  }
});

// Update hero slide
router.put('/admin/hero-slides/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      content,
      image_url,
      button_text,
      button_link,
      slide_order,
      is_active,
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE hero_slides 
       SET title = ?, subtitle = ?, content = ?, image_url = ?, 
           button_text = ?, button_link = ?, slide_order = ?, is_active = ?, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        title || '',
        subtitle || '',
        content || '',
        image_url || '',
        button_text || '',
        button_link || '',
        slide_order || 0,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    const [updatedSlide] = await pool.execute('SELECT * FROM hero_slides WHERE id = ?', [id]);

    // Clean image URL to prevent CORS errors
    const slide = {
      ...updatedSlide[0],
      image_url: cleanImageUrl(updatedSlide[0].image_url)
    };

    res.json({
      message: 'Hero slide updated successfully',
      slide: slide,
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(500).json({ message: 'Error updating hero slide' });
  }
});

// Delete hero slide
router.delete('/admin/hero-slides/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM hero_slides WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({ message: 'Error deleting hero slide' });
  }
});

// Reorder hero slides
router.put('/admin/hero-slides/reorder', authMiddleware, async (req, res) => {
  try {
    const { slides } = req.body;

    for (const slide of slides) {
      await pool.execute('UPDATE hero_slides SET slide_order = ? WHERE id = ?', [
        slide.slide_order,
        slide.id,
      ]);
    }

    res.json({ message: 'Hero slides reordered successfully' });
  } catch (error) {
    console.error('Error reordering hero slides:', error);
    res.status(500).json({ message: 'Error reordering hero slides' });
  }
});

module.exports = router;
