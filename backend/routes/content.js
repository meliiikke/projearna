const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all content sections (public)
router.get('/sections', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM content_sections WHERE is_active = true ORDER BY section_name');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific content section (public)
router.get('/sections/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_name = ? AND is_active = true', [sectionName]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Content section not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all services (public)
router.get('/services', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM services WHERE is_active = true ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all statistics (public)
router.get('/statistics', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM statistics WHERE is_active = true ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contact info (public)
router.get('/contact', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contact_info');
    const contactInfo = {};
    rows.forEach(row => {
      contactInfo[row.field_name] = row.field_value;
    });
    res.json(contactInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hero features (public)
router.get('/hero-features', async (req, res) => {
  try {
    console.log('PUBLIC: Fetching hero features...');
    const [rows] = await pool.execute('SELECT * FROM hero_features WHERE is_active = true ORDER BY order_index');
    console.log('PUBLIC: Hero features found:', rows.length, 'items');
    console.log('PUBLIC: Hero features data:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hero features:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get about features (public)
router.get('/about-features', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about_features WHERE is_active = true ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get about stats (public)
router.get('/about-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about_stats WHERE is_active = true ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('About stats fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get map points (public)
router.get('/map-points', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM map_points WHERE is_active = true ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error('Map points fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get map points for admin
router.get('/admin/map-points', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM map_points ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error('Map points admin fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create map point
router.post('/admin/map-points', authMiddleware, async (req, res) => {
  try {
    const { title, description, icon, order_index, is_active, x, y } = req.body;

    // Generate random coordinates if not provided
    const randomX = x || (Math.random() * 80 + 10);
    const randomY = y || (Math.random() * 80 + 10);

    // Check if x and y columns exist, if not use basic insert
    try {
      const [result] = await pool.execute(
        'INSERT INTO map_points (title, description, icon, order_index, is_active, x, y) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description || '', icon || '🏢', order_index || 0, is_active !== undefined ? is_active : true, randomX, randomY]
      );
      res.json({ message: 'Map point created successfully', id: result.insertId });
    } catch (columnError) {
      // Fallback to basic insert without x, y columns
      const [result] = await pool.execute(
        'INSERT INTO map_points (title, description, icon, order_index, is_active) VALUES (?, ?, ?, ?, ?)',
        [title, description || '', icon || '🏢', order_index || 0, is_active !== undefined ? is_active : true]
      );
      res.json({ message: 'Map point created successfully', id: result.insertId });
    }
  } catch (error) {
    console.error('Map point create error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update map point
router.put('/admin/map-points/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, order_index, is_active, x, y } = req.body;

    // If only coordinates are being updated (partial update)
    if (x !== undefined || y !== undefined) {
      try {
        const updateFields = [];
        const updateValues = [];
        
        if (x !== undefined) {
          updateFields.push('x = ?');
          updateValues.push(x);
        }
        if (y !== undefined) {
          updateFields.push('y = ?');
          updateValues.push(y);
        }
        
        updateValues.push(id);
        
        const [result] = await pool.execute(
          `UPDATE map_points SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Map point not found' });
        }
        
        return res.json({ message: 'Map point coordinates updated successfully', affectedRows: result.affectedRows });
      } catch (columnError) {
        // If x, y columns don't exist, ignore coordinate updates
        return res.json({ message: 'Map point updated (coordinates ignored)', affectedRows: 0 });
      }
    }

    // Full update
    try {
      const [result] = await pool.execute(
        'UPDATE map_points SET title = ?, description = ?, icon = ?, order_index = ?, is_active = ?, x = ?, y = ? WHERE id = ?',
        [title, description || '', icon || '🏢', order_index || 0, is_active !== undefined ? is_active : true, x || null, y || null, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Map point not found' });
      }

      res.json({ message: 'Map point updated successfully', affectedRows: result.affectedRows });
    } catch (columnError) {
      // Fallback to basic update without x, y columns
      const [result] = await pool.execute(
        'UPDATE map_points SET title = ?, description = ?, icon = ?, order_index = ?, is_active = ? WHERE id = ?',
        [title, description || '', icon || '🏢', order_index || 0, is_active !== undefined ? is_active : true, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Map point not found' });
      }

      res.json({ message: 'Map point updated successfully', affectedRows: result.affectedRows });
    }
  } catch (error) {
    console.error('Map point update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete map point
router.delete('/admin/map-points/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM map_points WHERE id = ?', [id]);
    res.json({ message: 'Map point deleted successfully' });
  } catch (error) {
    console.error('Map point delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update map points without coordinates
router.post('/admin/map-points/update-coordinates', authMiddleware, async (req, res) => {
  try {
    // Get all map points without coordinates
    const [points] = await pool.execute('SELECT id FROM map_points WHERE x IS NULL OR y IS NULL');
    
    let updatedCount = 0;
    
    for (const point of points) {
      const randomX = Math.random() * 80 + 10;
      const randomY = Math.random() * 80 + 10;
      
      try {
        await pool.execute(
          'UPDATE map_points SET x = ?, y = ? WHERE id = ?',
          [randomX, randomY, point.id]
        );
        updatedCount++;
      } catch (error) {
        console.error(`Error updating coordinates for point ${point.id}:`, error);
      }
    }
    
    res.json({ 
      message: `Updated coordinates for ${updatedCount} map points`,
      updatedCount 
    });
  } catch (error) {
    console.error('Update coordinates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update about_stats table structure
router.post('/update-about-stats-table', async (req, res) => {
  try {
    // Add value column if not exists
    await pool.execute(`
      ALTER TABLE about_stats 
      ADD COLUMN IF NOT EXISTS value VARCHAR(50) DEFAULT NULL AFTER title
    `);
    
    // Update existing data
    await pool.execute(`
      UPDATE about_stats 
      SET value = '2009' 
      WHERE title = 'Why We Are Oil & Gas Company' AND (value IS NULL OR value = '')
    `);
    
    // Insert new data
    await pool.execute(`
      INSERT INTO about_stats (title, value, icon, is_active) VALUES
      ('YILLINDAN BERİ', '2009', '⚡', 1),
      ('ÜLKEDE FAALİYET', '60', '⚡', 1),
      ('ÜRÜN SAYISI', '500+', '⚡', 1)
      ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      value = VALUES(value),
      icon = VALUES(icon)
    `);
    
    res.json({ message: 'About stats table updated successfully' });
  } catch (error) {
    console.error('Table update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Get footer bottom links (public)
router.get('/footer-bottom-links', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM footer_bottom_links WHERE is_active = true ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contact header (public)
router.get('/contact-header', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_name = ? AND is_active = true', ['contact_header']);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Contact header not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit contact message (public)
router.post('/contact', async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body); // Debug log
    
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !email || !message) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: 'Name, email and message are required' });
    }

    console.log('Inserting into database with values:', {
      name, email, phone: phone || null, company: company || null, subject: subject || null, message
    });

    const [result] = await pool.execute(
      'INSERT INTO contact_messages (name, email, phone, company, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, company || null, subject || null, message]
    );

    console.log('Database insert successful. Insert ID:', result.insertId);
    res.json({ message: 'Message sent successfully', id: result.insertId });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get contact messages for admin
router.get('/admin/contact-messages', authMiddleware, async (req, res) => {
  try {
    console.log('Admin requesting contact messages'); // Debug log
    const [rows] = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    console.log('Found messages:', rows.length); // Debug log
    console.log('Messages data:', rows); // Debug log
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark contact message as read
router.put('/admin/contact-messages/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE contact_messages SET is_read = true WHERE id = ?', [id]);
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact message
router.delete('/admin/contact-messages/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hero features for admin
router.get('/admin/hero-features', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM hero_features ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create hero feature
router.post('/admin/hero-features', authMiddleware, async (req, res) => {
  try {
    const { title, icon, order_index, is_active } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO hero_features (title, icon, order_index, is_active) VALUES (?, ?, ?, ?)',
      [title, icon || '⭐', order_index || 0, is_active !== undefined ? is_active : true]
    );

    res.json({ message: 'Hero feature created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hero feature
router.put('/admin/hero-features/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, order_index, is_active } = req.body;

    // Provide defaults for missing values
    const updateData = {
      title: title || '',
      icon: icon || '⭐',
      order_index: order_index !== undefined ? order_index : 0,
      is_active: is_active !== undefined ? is_active : true
    };

    const [result] = await pool.execute(
      'UPDATE hero_features SET title = ?, icon = ?, order_index = ?, is_active = ? WHERE id = ?',
      [updateData.title, updateData.icon, updateData.order_index, updateData.is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hero feature not found' });
    }

    res.json({ message: 'Hero feature updated successfully', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Hero feature update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete hero feature
router.delete('/admin/hero-features/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM hero_features WHERE id = ?', [id]);
    res.json({ message: 'Hero feature deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get about features for admin
router.get('/admin/about-features', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about_features ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create about feature
router.post('/admin/about-features', authMiddleware, async (req, res) => {
  try {
    const { title, icon, order_index, is_active } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO about_features (title, icon, order_index, is_active) VALUES (?, ?, ?, ?)',
      [title, icon || '⭐', order_index || 0, is_active !== undefined ? is_active : true]
    );

    res.json({ message: 'About feature created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update about feature
router.put('/admin/about-features/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, order_index, is_active } = req.body;

    // Provide defaults for missing values
    const updateData = {
      title: title || '',
      icon: icon || '⭐',
      order_index: order_index !== undefined ? order_index : 0,
      is_active: is_active !== undefined ? is_active : true
    };

    const [result] = await pool.execute(
      'UPDATE about_features SET title = ?, icon = ?, order_index = ?, is_active = ? WHERE id = ?',
      [updateData.title, updateData.icon, updateData.order_index, updateData.is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'About feature not found' });
    }

    res.json({ message: 'About feature updated successfully', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('About feature update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete about feature
router.delete('/admin/about-features/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM about_features WHERE id = ?', [id]);
    res.json({ message: 'About feature deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get about stats for admin
router.get('/admin/about-stats', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about_stats ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create about stat
router.post('/admin/about-stats', authMiddleware, async (req, res) => {
  try {
    const { title, value, icon, is_active } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO about_stats (title, value, icon, is_active) VALUES (?, ?, ?, ?)',
      [title, value || '', icon || '🏆', is_active !== undefined ? is_active : true]
    );

    res.json({ message: 'About stat created successfully', id: result.insertId });
  } catch (error) {
    console.error('About stat create error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update about stat
router.put('/admin/about-stats/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, icon, is_active } = req.body;

    // Provide defaults for missing values
    const updateData = {
      title: title || '',
      value: value || '',
      icon: icon || '🏆',
      is_active: is_active !== undefined ? is_active : true
    };

    const [result] = await pool.execute(
      'UPDATE about_stats SET title = ?, value = ?, icon = ?, is_active = ? WHERE id = ?',
      [updateData.title, updateData.value, updateData.icon, updateData.is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'About stat not found' });
    }

    res.json({ message: 'About stat updated successfully', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('About stat update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete about stat
router.delete('/admin/about-stats/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM about_stats WHERE id = ?', [id]);
    res.json({ message: 'About stat deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get footer bottom links for admin
router.get('/admin/footer-bottom-links', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM footer_bottom_links ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create footer bottom link
router.post('/admin/footer-bottom-links', authMiddleware, async (req, res) => {
  try {
    const { title, link, order_index, is_active } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO footer_bottom_links (title, link, order_index, is_active) VALUES (?, ?, ?, ?)',
      [title, link, order_index || 0, is_active !== undefined ? is_active : true]
    );

    res.json({ message: 'Footer bottom link created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update footer bottom link
router.put('/admin/footer-bottom-links/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, order_index, is_active } = req.body;

    // Provide defaults for missing values
    const updateData = {
      title: title || '',
      link: link || '',
      order_index: order_index !== undefined ? order_index : 0,
      is_active: is_active !== undefined ? is_active : true
    };

    const [result] = await pool.execute(
      'UPDATE footer_bottom_links SET title = ?, link = ?, order_index = ?, is_active = ? WHERE id = ?',
      [updateData.title, updateData.link, updateData.order_index, updateData.is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Footer bottom link not found' });
    }

    res.json({ message: 'Footer bottom link updated successfully', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Footer bottom link update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete footer bottom link
router.delete('/admin/footer-bottom-links/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM footer_bottom_links WHERE id = ?', [id]);
    res.json({ message: 'Footer bottom link deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN ROUTES (Protected)

// Get all content sections for admin
router.get('/admin/sections', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM content_sections ORDER BY section_name');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content section
router.put('/admin/sections/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, image_url, button_text, button_link, is_active } = req.body;

    console.log('Updating section:', id, req.body); // Debug log

    const [result] = await pool.execute(
      'UPDATE content_sections SET title = ?, subtitle = ?, content = ?, image_url = ?, button_text = ?, button_link = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title || '', subtitle || '', content || '', image_url || '', button_text || '', button_link || '', is_active !== undefined ? is_active : true, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Content section not found' });
    }

    res.json({ message: 'Content section updated successfully', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all services for admin
router.get('/admin/services', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM services ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service
router.post('/admin/services', authMiddleware, async (req, res) => {
  try {
    const { title, description, icon, image_url, order_index } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO services (title, description, icon, image_url, order_index) VALUES (?, ?, ?, ?, ?)',
      [title, description, icon, image_url, order_index || 0]
    );

    res.json({ message: 'Service created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/admin/services/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, image_url, order_index, is_active } = req.body;

    await pool.execute(
      'UPDATE services SET title = ?, description = ?, icon = ?, image_url = ?, order_index = ?, is_active = ? WHERE id = ?',
      [title, description, icon, image_url, order_index, is_active, id]
    );

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
router.delete('/admin/services/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all statistics for admin
router.get('/admin/statistics', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM statistics ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create statistic
router.post('/admin/statistics', authMiddleware, async (req, res) => {
  try {
    const { title, value, description, icon, order_index } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO statistics (title, value, description, icon, order_index) VALUES (?, ?, ?, ?, ?)',
      [title, value, description, icon, order_index || 0]
    );

    res.json({ message: 'Statistic created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update statistic
router.put('/admin/statistics/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, description, icon, order_index, is_active } = req.body;

    await pool.execute(
      'UPDATE statistics SET title = ?, value = ?, description = ?, icon = ?, order_index = ?, is_active = ? WHERE id = ?',
      [title, value, description, icon, order_index, is_active, id]
    );

    res.json({ message: 'Statistic updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete statistic
router.delete('/admin/statistics/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM statistics WHERE id = ?', [id]);
    res.json({ message: 'Statistic deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update contact info
router.put('/admin/contact', authMiddleware, async (req, res) => {
  try {
    const contactData = req.body;

    for (const [fieldName, fieldValue] of Object.entries(contactData)) {
      await pool.execute(
        'INSERT INTO contact_info (field_name, field_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE field_value = ?',
        [fieldName, fieldValue, fieldValue]
      );
    }

    res.json({ message: 'Contact information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Users Management
router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, email, role, is_active, created_at FROM users ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/users', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, role, is_active } = req.body;
    
    // Hash password before storing
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user', is_active !== undefined ? is_active : true]
    );

    res.json({ message: 'User created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, is_active } = req.body;

    let query = 'UPDATE users SET username = ?, email = ?, role = ?, is_active = ?';
    let params = [username, email, role, is_active];

    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admins Management
router.get('/admin/admins', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, email, is_active, created_at FROM admins ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/admins', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, is_active } = req.body;
    
    // Hash password before storing
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO admins (username, email, password, is_active) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, is_active !== undefined ? is_active : true]
    );

    res.json({ message: 'Admin created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/admin/admins/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, is_active } = req.body;

    let query = 'UPDATE admins SET username = ?, email = ?, is_active = ?';
    let params = [username, email, is_active];

    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
    res.json({ message: 'Admin updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/admin/admins/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM admins WHERE id = ?', [id]);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
