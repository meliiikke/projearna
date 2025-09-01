const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arna_energy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Database initialization
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'arna_energy'}`);
    connection.end();

    // Create tables
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS content_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_name VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        content TEXT,
        image_url VARCHAR(255),
        button_text VARCHAR(255),
        button_link VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Hero slides tablosu
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        content TEXT,
        image_url TEXT,
        button_text VARCHAR(255),
        button_link VARCHAR(255),
        slide_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        icon VARCHAR(255),
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        field_name VARCHAR(255) UNIQUE NOT NULL,
        field_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Map Points tablosu (Harita noktaları)
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS map_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        icon VARCHAR(50) DEFAULT '📍',
        is_active BOOLEAN DEFAULT true,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default map points
    await promisePool.execute(`
      INSERT INTO map_points (title, description, latitude, longitude, icon, order_index, is_active) VALUES
      ('Istanbul Office', 'Main office in Istanbul', 41.0082, 28.9784, '🏢', 1, 1),
      ('Ankara Office', 'Capital office in Ankara', 39.9334, 32.8597, '🏢', 2, 1),
      ('Izmir Office', 'Aegean region office', 38.4192, 27.1287, '🏢', 3, 1),
      ('Antalya Office', 'Mediterranean office', 36.8969, 30.7133, '🏢', 4, 1),
      ('Bursa Office', 'Marmara region office', 40.1885, 29.0610, '🏢', 5, 1)
      ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      latitude = VALUES(latitude),
      longitude = VALUES(longitude),
      icon = VALUES(icon),
      order_index = VALUES(order_index)
    `);

    // Footer bottom links tablosu
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS footer_bottom_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link VARCHAR(255) DEFAULT '#',
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await promisePool.execute(`
      INSERT IGNORE INTO admins (username, email, password) 
      VALUES ('admin', 'admin@arna.com', ?)
    `, [hashedPassword]);

    // Insert default content
    await insertDefaultContent();
    
    // Insert default hero slides
    await insertDefaultHeroSlides();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

const insertDefaultContent = async () => {
  try {
    // Hero section
    await promisePool.execute(`
      INSERT INTO content_sections (section_name, title, subtitle, content, button_text, button_link) 
      VALUES (
        'hero', 
        'Meeting Future Demand In A Sustainable Way', 
        'We\'re doing our part in that regard with greener practices that don\'t harm the environment.',
        'Leading the way in sustainable energy solutions for a better tomorrow',
        'DISCOVER MORE',
        '#services'
      )
      ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      content = VALUES(content),
      button_text = VALUES(button_text),
      button_link = VALUES(button_link)
    `);

    // About section
    await promisePool.execute(`
      INSERT INTO content_sections (section_name, title, subtitle, content, button_text, button_link) 
      VALUES (
        'about', 
        'Providing affordable and reliable energy', 
        'Who We Are',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
        'READ MORE',
        '#about'
      )
      ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      content = VALUES(content),
      button_text = VALUES(button_text),
      button_link = VALUES(button_link)
    `);

    // Mission section
    await promisePool.execute(`
      INSERT INTO content_sections (section_name, title, subtitle, content) 
      VALUES (
        'mission', 
        'A Vital Energy Resource For A Better Tomorrow', 
        'Preserve And Conserve',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Lorem ipsum amet dolor sit consecetur.'
      )
      ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      content = VALUES(content)
    `);

    // Default services
    const services = [
      {
        title: 'Clean energy for a bright future',
        description: 'Sustainable energy solutions that protect our environment',
        icon: '🌱'
      },
      {
        title: 'Sustainable development',
        description: 'Building a better future through responsible practices',
        icon: '♻️'
      },
      {
        title: 'Improving access to energy',
        description: 'Making clean energy accessible to communities worldwide',
        icon: '⚡'
      }
    ];

    for (let i = 0; i < services.length; i++) {
      await promisePool.execute(`
        INSERT IGNORE INTO services (title, description, icon, order_index) 
        VALUES (?, ?, ?, ?)
      `, [services[i].title, services[i].description, services[i].icon, i]);
    }

    // Default statistics
    const stats = [
      { title: 'Years of Experience', value: '25+', description: 'Years of Experience', icon: '📅' },
      { title: 'Offices Worldwide', value: '77', description: 'Offices Worldwide', icon: '🏢' },
      { title: 'Workers Employed', value: '38K', description: 'Workers Employed', icon: '👥' }
    ];

    for (let i = 0; i < stats.length; i++) {
      await promisePool.execute(`
        INSERT IGNORE INTO statistics (title, value, description, icon, order_index) 
        VALUES (?, ?, ?, ?, ?)
      `, [stats[i].title, stats[i].value, stats[i].description, stats[i].icon, i]);
    }

    // Default contact info
    const contactInfo = [
      { field_name: 'phone', field_value: '+90-212-000-0000' },
      { field_name: 'email', field_value: 'info@arna.com' },
      { field_name: 'address', field_value: 'Istanbul, Turkey' },
      { field_name: 'working_hours', field_value: 'Mon-Fri: 9:00 AM - 6:00 PM' }
    ];

    for (const contact of contactInfo) {
      await promisePool.execute(`
        INSERT IGNORE INTO contact_info (field_name, field_value) 
        VALUES (?, ?)
      `, [contact.field_name, contact.field_value]);
    }

    // Default footer bottom links
    const footerBottomLinks = [
      { title: 'Privacy Policy', link: '#', order_index: 1 },
      { title: 'Terms of Service', link: '#', order_index: 2 }
    ];

    for (const link of footerBottomLinks) {
      await promisePool.execute(`
        INSERT IGNORE INTO footer_bottom_links (title, link, order_index) 
        VALUES (?, ?, ?)
      `, [link.title, link.link, link.order_index]);
    }

  } catch (error) {
    console.error('Error inserting default content:', error);
  }
};

const insertDefaultHeroSlides = async () => {
  try {
    // Default hero slides
    await promisePool.execute(`
      INSERT IGNORE INTO hero_slides (title, subtitle, content, button_text, button_link, slide_order, is_active) 
      VALUES (
        'Meeting Future Demand In A Sustainable Way', 
        'We\'re doing our part in that regard with greener practices that don\'t harm the environment.',
        'Leading the way in sustainable energy solutions for a better tomorrow',
        'DISCOVER MORE',
        '#services',
        0,
        1
      )
    `);

    await promisePool.execute(`
      INSERT IGNORE INTO hero_slides (title, subtitle, content, button_text, button_link, slide_order, is_active) 
      VALUES (
        'Advanced Energy Solutions', 
        'Cutting-edge technology meets environmental responsibility for a cleaner future.',
        'Innovative approaches to carbon capture and sustainable energy production',
        'LEARN MORE',
        '#about',
        1,
        1
      )
    `);

    console.log('Default hero slides inserted');
  } catch (error) {
    console.error('Error inserting default hero slides:', error);
  }
};

module.exports = { pool: promisePool, initializeDatabase };
