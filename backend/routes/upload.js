const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 🔧 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🔧 Cloudinary storage ayarı
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'projearna_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    resource_type: 'image',
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }]
  }
});

// 🔧 Multer config
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
});

// 📌 Resim yükleme (Admin only)
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    res.header('Access-Control-Allow-Origin', '*');

    res.json({
      message: 'Resim başarıyla Cloudinary\'ye yüklendi',
      imageUrl: req.file.path,      // Cloudinary URL
      fileName: req.file.filename,  // Cloudinary public_id
      cloudinaryId: req.file.filename
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Resim yükleme hatası', error: error.message });
  }
});

// 📌 Yüklenen resimleri listele (Admin only)
router.get('/images', authMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:projearna_uploads')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const images = result.resources.map(r => ({
      name: r.public_id.split('/').pop(),
      url: r.secure_url,
      cloudinaryId: r.public_id,
      uploadDate: r.created_at,
      format: r.format,
      size: r.bytes
    }));

    res.header('Access-Control-Allow-Origin', '*');
    res.json(images);
  } catch (error) {
    console.error('Error listing Cloudinary images:', error);
    res.status(500).json({ message: 'Resimler listelenirken hata oluştu', error: error.message });
  }
});

// 📌 Resim silme (Admin only)
router.delete('/image/:cloudinaryId', authMiddleware, async (req, res) => {
  try {
    const cloudinaryId = req.params.cloudinaryId;
    const result = await cloudinary.uploader.destroy(cloudinaryId);

    res.header('Access-Control-Allow-Origin', '*');

    if (result.result === 'ok') {
      res.json({ message: 'Resim başarıyla silindi' });
    } else {
      res.status(404).json({ message: 'Resim bulunamadı veya silinemedi' });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ message: 'Resim silinirken hata oluştu', error: error.message });
  }
});

// 📌 Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    message: 'Cloudinary Upload Service',
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: 'projearna_uploads'
  });
});

module.exports = router;
