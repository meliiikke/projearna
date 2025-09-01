const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Upload klasörünü root klasörde oluştur
//const uploadDir = path.join(__dirname, '../uploads');
//if (!fs.existsSync(uploadDir)) {
//  fs.mkdirSync(uploadDir, { recursive: true });
//}

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
    
    res.json({
      message: 'Resim başarıyla yüklendi',
      imageUrl: imageUrl,
      fileName: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Resim yükleme hatası' });
  }
});

// Yüklenen resimleri listele (Admin only)
router.get('/images', authMiddleware, (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        name: file,
        url: `/uploads/${file}`,
        uploadDate: fs.statSync(path.join(uploadDir, file)).mtime
      }))
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

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
