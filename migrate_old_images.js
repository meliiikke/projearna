const { v2: cloudinary } = require('cloudinary');
const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Eski resimleri veritabanından al
async function getOldImages() {
  try {
    const [heroSlides] = await pool.execute(
      "SELECT id, title, image_url FROM hero_slides WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'"
    );
    
    const [contentSections] = await pool.execute(
      "SELECT id, title, image_url FROM content_sections WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'"
    );
    
    const [services] = await pool.execute(
      "SELECT id, title, image_url FROM services WHERE image_url LIKE '/uploads/%' OR image_url LIKE 'img-%'"
    );

    return {
      heroSlides: heroSlides.map(slide => ({ ...slide, table: 'hero_slides' })),
      contentSections: contentSections.map(section => ({ ...section, table: 'content_sections' })),
      services: services.map(service => ({ ...service, table: 'services' }))
    };
  } catch (error) {
    console.error('Error fetching old images:', error);
    return { heroSlides: [], contentSections: [], services: [] };
  }
}

// Resmi Cloudinary'ye yükle
async function uploadToCloudinary(imagePath, folder = 'legacy_uploads') {
  try {
    // Dosya var mı kontrol et
    const fullPath = path.join(__dirname, imagePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Dosya bulunamadı: ${imagePath}`);
      return null;
    }

    const result = await cloudinary.uploader.upload(fullPath, {
      folder: folder,
      resource_type: 'image',
      transformation: [{ width: 1920, height: 1080, crop: 'limit' }]
    });

    console.log(`✅ Yüklendi: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Upload hatası (${imagePath}):`, error.message);
    return null;
  }
}

// Veritabanını güncelle
async function updateDatabase(table, id, newImageUrl) {
  try {
    await pool.execute(
      `UPDATE ${table} SET image_url = ? WHERE id = ?`,
      [newImageUrl, id]
    );
    console.log(`✅ DB güncellendi: ${table} ID ${id}`);
  } catch (error) {
    console.error(`❌ DB güncelleme hatası:`, error);
  }
}

// Ana migration fonksiyonu
async function migrateOldImages() {
  console.log('🔄 Eski resimler Cloudinary\'ye taşınıyor...\n');
  
  const oldImages = await getOldImages();
  const allImages = [
    ...oldImages.heroSlides,
    ...oldImages.contentSections,
    ...oldImages.services
  ];

  console.log(`📊 Toplam ${allImages.length} eski resim bulundu\n`);

  for (const item of allImages) {
    console.log(`🔄 İşleniyor: ${item.title} (${item.table})`);
    console.log(`   Eski URL: ${item.image_url}`);
    
    // Resmi Cloudinary'ye yükle
    const newImageUrl = await uploadToCloudinary(item.image_url, 'projearna_uploads');
    
    if (newImageUrl) {
      // Veritabanını güncelle
      await updateDatabase(item.table, item.id, newImageUrl);
      console.log(`   Yeni URL: ${newImageUrl}\n`);
    } else {
      console.log(`   ❌ Yüklenemedi, NULL yapılıyor\n`);
      // Yüklenemeyen resimleri NULL yap
      await updateDatabase(item.table, item.id, null);
    }
    
    // Rate limiting için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Migration tamamlandı!');
  process.exit(0);
}

// Script'i çalıştır
if (require.main === module) {
  migrateOldImages().catch(error => {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  });
}

module.exports = { migrateOldImages, getOldImages, uploadToCloudinary };
