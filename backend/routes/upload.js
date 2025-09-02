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

// Upload klasörünü backend klasöründe tut (fallback için)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

// Debug endpoint - uploads klasörünü kontrol et
router.get('/debug', (req, res) => {
  try {
    const uploadDirExists = fs.existsSync(uploadDir);
    const files = uploadDirExists ? fs.readdirSync(uploadDir) : [];
    
    res.json({
      uploadDir: uploadDir,
      uploadDirExists: uploadDirExists,
      files: files,
      currentWorkingDir: process.cwd(),
      __dirname: __dirname
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resim proxy endpoint - CORS sorununu çözmek için (geliştirilmiş)
router.get('/proxy/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resim bulunamadı' });
    }
    
    // Dosya türünü belirle
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.avif':
        contentType = 'image/avif';
        break;
    }
    
    // Ultra agresif CORS headers - Railway için
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');
    res.header('Vary', 'Origin');
    res.header('Cache-Control', 'public, max-age=31536000, immutable');
    res.header('Content-Type', contentType);
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Dosyayı gönder
    res.sendFile(filePath);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ message: 'Resim yüklenirken hata oluştu' });
  }
});

// Alternatif resim serving endpoint - daha basit
router.get('/serve/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resim bulunamadı' });
    }
    
    // Ultra agresif CORS headers - Railway için
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');
    res.header('Vary', 'Origin');
    res.header('Cache-Control', 'public, max-age=31536000, immutable');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve error:', error);
    res.status(500).json({ message: 'Resim yüklenirken hata oluştu' });
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

// Base64 resim endpoint - CORS sorununu tamamen bypass eder
router.get('/base64/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resim bulunamadı' });
    }
    
    // Dosyayı base64 olarak oku
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    
    // Dosya türünü belirle
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'image/jpeg'; // default
    
    switch (ext) {
      case '.png':
        mimeType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      case '.avif':
        mimeType = 'image/avif';
        break;
    }
    
    // Base64 data URL oluştur
    const dataUrl = `data:${mimeType};base64,${base64String}`;
    
    // Ultra agresif CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');
    res.header('Content-Type', 'application/json');
    
    res.json({
      success: true,
      dataUrl: dataUrl,
      mimeType: mimeType,
      filename: filename
    });
  } catch (error) {
    console.error('Base64 error:', error);
    res.status(500).json({ message: 'Resim base64 dönüştürülürken hata oluştu' });
  }
});

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
