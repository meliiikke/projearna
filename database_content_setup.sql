-- ARNA Energy Website İçerikleri
-- Bu SQL kodunu phpMyAdmin'de çalıştırın

-- Content Sections (Ana içerik bölümleri)
INSERT INTO content_sections (section_name, title, subtitle, content, button_text, button_link, is_active) 
VALUES 
-- Hero Section
('hero', 
 'Geleceğin Enerji İhtiyaçlarını Sürdürülebilir Şekilde Karşılamak', 
 'Çevreye zarar vermeyen yeşil uygulamalarla bu konuda üzerimize düşeni yapıyoruz.',
 'Daha iyi bir yarın için sürdürülebilir enerji çözümlerinde öncülük ediyoruz. Temiz, güvenilir ve uygun fiyatlı enerji sağlayarak çevremizi koruma konusunda kararlıyız.',
 'DAHA FAZLA KEŞFET',
 '#services',
 1),

-- About Section  
('about', 
 'Uygun Fiyatlı ve Güvenilir Enerji Sağlama', 
 'Biz Kimiz',
 'ARNA Energy olarak, enerji sektöründe 25 yılı aşkın deneyimimizle sektörün önde gelen firmalarından biriyiz. Sürdürülebilir enerji çözümleri ve çevre dostu teknolojilerle geleceğe yatırım yapıyoruz. Müşterilerimize en kaliteli hizmeti sunmak için sürekli kendimizi geliştiriyor ve yenilikçi çözümler üretiyoruz.',
 'HAKKIMIZDA DAHA FAZLA',
 '#about',
 1),

-- Mission Section
('mission', 
 'Daha İyi Bir Yarın İçin Hayati Enerji Kaynağı', 
 'Koruma ve Muhafaza',
 'Enerji sektöründe sürdürülebilirlik ve çevre bilinci ile hareket ederek, gelecek nesillere temiz bir dünya bırakma misyonumuzu sürdürüyoruz. Yenilenebilir enerji kaynaklarına yaptığımız yatırımlarla hem çevreyi koruyor hem de ülkemizin enerji bağımsızlığına katkıda bulunuyoruz.',
 '',
 '',
 1),

-- Contact Header Section
('contact_header',
 'İletişime Geçin',
 'Bizimle İletişim',
 'Sorularınız, projeleriniz veya iş birliği teklifleriniz için bizimle iletişim geçmekten çekinmeyin. Uzman ekibimiz size en kısa sürede dönüş yapacaktır.',
 'İLETİŞİM FORMU',
 '#contact-form',
 1),

-- Services Header Section
('services_header',
 'Our Services',
 'Leading Energy Solutions',
 'We provide comprehensive energy solutions that meet the demands of today while building a sustainable tomorrow.',
 '',
 '',
 1),

-- Statistics Header Section
('statistics_header',
 'Global Presence',
 'We Spread Around The World',
 'Lorem ipsum consectetur hardrerit dictum cursor vitae volutpat elit vel mauris. Etlacerat diam volutpat lectus aliquam ornare tortor sed ut molestie lorem.',
 '',
 '',
 1)

ON DUPLICATE KEY UPDATE
title = VALUES(title),
subtitle = VALUES(subtitle),
content = VALUES(content),
button_text = VALUES(button_text),
button_link = VALUES(button_link);

-- Services (Hizmetler)
INSERT INTO services (title, description, icon, order_index, is_active) 
VALUES 
('Temiz Enerji Çözümleri', 
 'Güneş, rüzgar ve hidroelektrik gibi yenilenebilir enerji kaynaklarından faydalanarak çevre dostu enerji üretimi sağlıyoruz. Karbon ayak izinizi azaltarak sürdürülebilir bir gelecek inşa ediyoruz.',
 '🌱', 
 1, 
 1),

('Enerji Verimliliği Danışmanlığı', 
 'İşletmenizin enerji tüketimini optimize ederek maliyetlerinizi düşürün. Uzman ekibimizle enerji tasarrufu sağlayan çözümler geliştiriyor ve uyguluyoruz.',
 '⚡', 
 2, 
 1),

('Proje Geliştirme ve Yönetimi', 
 'Enerji projelerinizi baştan sona yönetiyoruz. Planlama aşamasından uygulamaya kadar her adımda yanınızdayız. Büyük ölçekli enerji tesisleri kurulum ve işletmesi.',
 '🏗️', 
 3, 
 1),

('Teknik Destek ve Bakım', 
 'Enerji sistemlerinizin kesintisiz çalışması için 7/24 teknik destek sağlıyoruz. Periyodik bakım ve onarım hizmetleriyle sistemlerinizin verimliliğini maksimumda tutuyoruz.',
 '🔧', 
 4, 
 1),

('Ar-Ge ve İnovasyon', 
 'Enerji teknolojilerinde sürekli araştırma ve geliştirme yaparak sektöre yenilik getiriyoruz. Akıllı enerji sistemleri ve IoT entegrasyonu ile geleceğin teknolojilerini bugün sunuyoruz.',
 '🚀', 
 5, 
 1),

('Çevre Danışmanlığı', 
 'Çevresel etki değerlendirmeleri ve sürdürülebilirlik raporları hazırlıyoruz. Çevre mevzuatına uyum konusunda kapsamlı danışmanlık hizmetleri sunuyoruz.',
 '🌍', 
 6, 
 1)

ON DUPLICATE KEY UPDATE
title = VALUES(title),
description = VALUES(description),
icon = VALUES(icon),
order_index = VALUES(order_index);

-- Statistics (İstatistikler)
INSERT INTO statistics (title, value, description, icon, order_index, is_active) 
VALUES 
('Yıllık Deneyim', 
 '25+', 
 'Yıllık sektör deneyimi', 
 '📅', 
 1, 
 1),

('Dünya Çapında Ofis', 
 '77', 
 'Ofis ve temsilcilik', 
 '🏢', 
 2, 
 1),

('Çalışan Sayısı', 
 '38K', 
 'Dünya genelinde çalışan', 
 '👥', 
 3, 
 1),

('Tamamlanan Proje', 
 '500+', 
 'Başarıyla tamamlanan proje', 
 '✅', 
 4, 
 1),

('Kurulu Güç', 
 '2.5GW', 
 'Toplam kurulu güç kapasitesi', 
 '⚡', 
 5, 
 1),

('Ülke Sayısı', 
 '45', 
 'Hizmet verdiğimiz ülke', 
 '🌎', 
 6, 
 1)

ON DUPLICATE KEY UPDATE
title = VALUES(title),
value = VALUES(value),
description = VALUES(description),
icon = VALUES(icon),
order_index = VALUES(order_index);

-- Contact Information (İletişim Bilgileri)
INSERT INTO contact_info (field_name, field_value) 
VALUES 
('phone', '+90 212 555 0123'),
('email', 'info@arna.com.tr'),
('address', 'Levent Mahallesi, Büyükdere Caddesi No:201 Şişli/İSTANBUL'),
('working_hours', 'Pazartesi - Cuma: 09:00 - 18:00'),
('fax', '+90 212 555 0124'),
('website', 'www.arna.com.tr'),
('linkedin', 'https://linkedin.com/company/arna-energy'),
('instagram', 'https://instagram.com/arnaenerji')

ON DUPLICATE KEY UPDATE
field_value = VALUES(field_value);

-- Contact Messages (İletişim Mesajları)
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
);

-- NEW TABLES FOR EDITABLE STATIC CONTENT

-- Hero Features (Hero bölümündeki özellikler)
CREATE TABLE IF NOT EXISTS hero_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO hero_features (title, icon, order_index, is_active) VALUES
('CCUS Technology', '🔬', 1, 1),
('Sustainability', '♻️', 2, 1),
('Energy Transition', '⚡', 3, 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
icon = VALUES(icon),
order_index = VALUES(order_index);

-- About Features (About bölümündeki özellikler)
CREATE TABLE IF NOT EXISTS about_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT '✓',
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO about_features (title, icon, order_index, is_active) VALUES
('Clean energy for a bright future', '✓', 1, 1),
('Sustainable development', '✓', 2, 1),
('Improving access to energy', '✓', 3, 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
icon = VALUES(icon),
order_index = VALUES(order_index);

-- About Stats (About bölümündeki istatistik)
CREATE TABLE IF NOT EXISTS about_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO about_stats (title, icon, is_active) VALUES
('Why We Are Oil & Gas Company', '⚡', 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
icon = VALUES(icon);

-- Footer Quick Links (Footer hızlı linkler)
CREATE TABLE IF NOT EXISTS footer_quick_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO footer_quick_links (title, link, order_index, is_active) VALUES
('Home', '#home', 1, 1),
('About Us', '#about', 2, 1),
('Services', '#services', 3, 1),
('Contact', '#contact', 4, 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
link = VALUES(link),
order_index = VALUES(order_index);

-- Footer Services (Footer hizmetler)
CREATE TABLE IF NOT EXISTS footer_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255) DEFAULT '#',
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO footer_services (title, link, order_index, is_active) VALUES
('Clean Energy', '#', 1, 1),
('Sustainable Development', '#', 2, 1),
('Energy Transition', '#', 3, 1),
('Environmental Solutions', '#', 4, 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
link = VALUES(link),
order_index = VALUES(order_index);

-- Footer Social Links (Footer sosyal medya linkleri)
CREATE TABLE IF NOT EXISTS footer_social_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  link VARCHAR(255) DEFAULT '#',
  aria_label VARCHAR(255),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO footer_social_links (title, icon, link, aria_label, order_index, is_active) VALUES
('Facebook', '📘', '#', 'Facebook', 1, 1),
('Twitter', '🐦', '#', 'Twitter', 2, 1),
('LinkedIn', '💼', '#', 'LinkedIn', 3, 1),
('Instagram', '📷', '#', 'Instagram', 4, 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
icon = VALUES(icon),
link = VALUES(link),
aria_label = VALUES(aria_label),
order_index = VALUES(order_index);

-- Footer Bottom Links (Footer alt linkler)
CREATE TABLE IF NOT EXISTS footer_bottom_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255) DEFAULT '#',
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO footer_bottom_links (title, link, order_index, is_active) VALUES
('Privacy Policy', '#', 1, 1),
('Terms of Service', '#', 2, 1),
('Admin', '/admin/login', 3, 1)
ON DUPLICATE KEY UPDATE
title = VALUES(title),
link = VALUES(link),
order_index = VALUES(order_index);

-- Admin User Setup (Admin kullanıcısı kurulumu)
-- Default admin kullanıcısı oluştur (username: admin, password: admin123)
INSERT INTO admins (username, email, password, is_active) VALUES 
('admin', 'admin@arnaenergy.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1)
ON DUPLICATE KEY UPDATE
username = VALUES(username),
email = VALUES(email),
password = VALUES(password),
is_active = VALUES(is_active);

-- Verification Query (Doğrulama sorguları)
-- Bu sorguları çalıştırarak verilerin düzgün eklendiğini kontrol edebilirsiniz:

-- SELECT * FROM content_sections;
-- SELECT * FROM services ORDER BY order_index;
-- SELECT * FROM statistics ORDER BY order_index;
-- SELECT * FROM contact_info;
-- SELECT * FROM hero_features ORDER BY order_index;
-- SELECT * FROM about_features ORDER BY order_index;
-- SELECT * FROM about_stats;
-- SELECT * FROM footer_quick_links ORDER BY order_index;
-- SELECT * FROM footer_services ORDER BY order_index;
-- SELECT * FROM footer_social_links ORDER BY order_index;
-- SELECT * FROM footer_bottom_links ORDER BY order_index;
-- SELECT * FROM admins;
