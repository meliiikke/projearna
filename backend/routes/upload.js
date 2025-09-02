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
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
    use_filename: true,
    unique_filename: true,
    upload_preset: 'projearna_uploads' // Upload preset kullan
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

    res.json({
        message: 'Resim başarıyla Cloudinary\'ye yüklendi',
        imageUrl: req.file.path,             // Cloudinary URL
        fileName: req.file.originalname,     // Orijinal dosya adı
        cloudinaryId: req.file.filename || req.file.public_id  // Cloudinary public_id
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
      cloudinaryId: r.public_id, // "projearna_uploads/abc123" formatında
      uploadDate: r.created_at,
      format: r.format,
      size: r.bytes
    }));

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
    
    // Eğer cloudinaryId undefined ise hata döndür
    if (!cloudinaryId || cloudinaryId === 'undefined') {
      return res.status(400).json({ message: 'Cloudinary ID bulunamadı' });
    }
    
    // Eğer gelen değer bir URL ise, public_id'yi çıkar
    let publicId = cloudinaryId;
    if (cloudinaryId.includes('cloudinary.com')) {
      // URL'den public_id'yi çıkar: https://res.cloudinary.com/.../projearna_uploads/abc123.jpg -> projearna_uploads/abc123
      const urlParts = cloudinaryId.split('/');
      const folderIndex = urlParts.findIndex(part => part === 'projearna_uploads');
      if (folderIndex !== -1 && urlParts[folderIndex + 1]) {
        const filename = urlParts[folderIndex + 1];
        publicId = `projearna_uploads/${filename.split('.')[0]}`;
      } else {
        return res.status(400).json({ message: 'Geçersiz Cloudinary URL formatı' });
      }
    }
    
    console.log('Deleting image with publicId:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);

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
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: 'projearna_uploads'
  });
});

module.exports = router;
