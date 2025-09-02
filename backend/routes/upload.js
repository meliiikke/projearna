const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Upload klasörünü backend klasöründe tut
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Dosya adını unique yapıyoruz
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Sadece resim dosyalarına izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Resim yükleme endpoint'i (Admin only)
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Ultra agresif CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');
    
    // Railway zaten HTTPS veriyor
    const protocol = req.protocol;
    const host = req.get('host');
    
    res.json({
      message: 'Resim başarıyla yüklendi',
      imageUrl: imageUrl,
      fullUrl: `${protocol}://${host}${imageUrl}`,
      fileName: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Resim yükleme hatası' });
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

// Yüklenen resimleri listele (Admin only)
router.get('/images', authMiddleware, (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    // Railway zaten HTTPS veriyor
    const protocol = req.protocol;
    const host = req.get('host');
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        name: file,
        url: `/uploads/${file}`,
        fullUrl: `${protocol}://${host}/uploads/${file}`,
        uploadDate: fs.statSync(path.join(uploadDir, file)).mtime
      }))
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    // Ultra agresif CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');

    res.json(images);
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ message: 'Resimler listelenirken hata oluştu' });
  }
});

// Resim silme (Admin only)
router.delete('/image/:filename', authMiddleware, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // CORS headers ekle
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
      res.json({ message: 'Resim başarıyla silindi' });
    } else {
      res.status(404).json({ message: 'Resim bulunamadı' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Resim silinirken hata oluştu' });
  }
});

module.exports = router;
