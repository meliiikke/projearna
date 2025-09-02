const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage ayarı
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'projearna_uploads', // Cloudinary'de klasör ismi
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'avif'],
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }] // Resim boyutunu optimize et
  }
});

// Cloudinary kullandığımız için local upload klasörüne ihtiyacımız yok

// Multer konfigürasyonu - Cloudinary için
const fileFilter = (req, file, cb) => {
  // Sadece resim dosyalarına izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({
  storage: storage, // Cloudinary storage kullan
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary'de daha büyük)
  },
  fileFilter: fileFilter
});

// Resim yükleme endpoint'i (Admin only) - Cloudinary ile
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    // Cloudinary'den gelen URL
    const cloudinaryUrl = req.file.path;
    
    // Ultra agresif CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');
    
    res.json({
      message: 'Resim başarıyla Cloudinary\'ye yüklendi',
      imageUrl: cloudinaryUrl,
      fullUrl: cloudinaryUrl,
      fileName: req.file.filename,
      cloudinaryId: req.file.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Resim yükleme hatası', error: error.message });
  }
});

// Debug endpoint - Cloudinary durumunu kontrol et
router.get('/debug', (req, res) => {
  try {
    res.json({
      message: 'Cloudinary Upload Service',
      cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'projearna_uploads'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yüklenen resimleri listele (Admin only) - Cloudinary'den
router.get('/images', authMiddleware, async (req, res) => {
  try {
    // Cloudinary'den resimleri listele
    const result = await cloudinary.search
      .expression('folder:projearna_uploads')
      .sort_by([['created_at', 'desc']])
      .max_results(50)
      .execute();

    const images = result.resources.map(resource => ({
      name: resource.public_id.split('/').pop(),
      url: resource.secure_url,
      fullUrl: resource.secure_url,
      uploadDate: resource.created_at,
      cloudinaryId: resource.public_id,
      format: resource.format,
      size: resource.bytes
    }));

    // Ultra agresif CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');

    res.json(images);
  } catch (error) {
    console.error('Error listing Cloudinary images:', error);
    res.status(500).json({ message: 'Resimler listelenirken hata oluştu', error: error.message });
  }
});

// Base64 endpoint'i kaldırıldı - Cloudinary kullanıyoruz

// Resim silme (Admin only) - Cloudinary'den
router.delete('/image/:cloudinaryId', authMiddleware, async (req, res) => {
  try {
    const cloudinaryId = req.params.cloudinaryId;
    
    // Cloudinary'den resmi sil
    const result = await cloudinary.uploader.destroy(cloudinaryId);
    
    if (result.result === 'ok') {
      // Ultra agresif CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Expose-Headers', '*');
      res.header('Access-Control-Allow-Credentials', 'false');
      res.header('Access-Control-Max-Age', '86400');
      
      res.json({ message: 'Resim başarıyla Cloudinary\'den silindi' });
    } else {
      res.status(404).json({ message: 'Resim bulunamadı veya silinemedi' });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ message: 'Resim silinirken hata oluştu', error: error.message });
  }
});

module.exports = router;
