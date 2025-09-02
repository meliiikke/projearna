const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'projearna_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    resource_type: 'image',
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
    use_filename: true,
    unique_filename: true,
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      return `img-${timestamp}-${random}`;
    }
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
});

// ✅ Cloudinary image upload route
router.post('/image', upload.single('image'), (req, res) => {
  try {
    console.log('📤 Cloudinary upload request received');
    console.log('📁 File:', req.file);
    console.log('🔑 Cloudinary config check:', {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
      cloudNameValue: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET'
    });

    if (!req.file) {
      console.log('❌ No file received');
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    console.log('✅ File uploaded to Cloudinary successfully:', {
      path: req.file.path,
      filename: req.file.filename,
      originalname: req.file.originalname
    });

    res.json({
      message: 'Resim başarıyla Cloudinary\'ye yüklendi',
      imageUrl: req.file.path,        // Cloudinary URL
      fileName: req.file.originalname,    // Orijinal dosya adı
      cloudinaryId: req.file.filename    // Cloudinary public_id
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// ✅ List images from Cloudinary
router.get('/images', async (req, res) => {
  try {
    console.log('📋 Fetching images from Cloudinary...');
    
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

    console.log(`✅ Found ${images.length} images in Cloudinary`);
    res.json(images);
  } catch (error) {
    console.error('❌ Error listing Cloudinary images:', error);
    res.status(500).json({ message: 'Resimler listelenirken hata oluştu', error: error.message });
  }
});

// ✅ Delete image from Cloudinary
router.delete('/image/:cloudinaryId', async (req, res) => {
  try {
    const cloudinaryId = req.params.cloudinaryId;
    
    console.log('🗑️ Deleting image from Cloudinary:', cloudinaryId);
    
    if (!cloudinaryId || cloudinaryId === 'undefined') {
      return res.status(400).json({ message: 'Cloudinary ID bulunamadı' });
    }
    
    // Eğer gelen değer bir URL ise, public_id'yi çıkar
    let publicId = cloudinaryId;
    if (cloudinaryId.includes('cloudinary.com')) {
      const urlParts = cloudinaryId.split('/');
      const folderIndex = urlParts.findIndex(part => part === 'projearna_uploads');
      if (folderIndex !== -1 && urlParts[folderIndex + 1]) {
        const filename = urlParts[folderIndex + 1];
        publicId = `projearna_uploads/${filename.split('.')[0]}`;
      } else {
        return res.status(400).json({ message: 'Geçersiz Cloudinary URL formatı' });
      }
    }
    
    console.log('🗑️ Deleting with publicId:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log('✅ Image deleted successfully');
      res.json({ message: 'Resim başarıyla silindi' });
    } else {
      console.log('❌ Image not found or could not be deleted');
      res.status(404).json({ message: 'Resim bulunamadı veya silinemedi' });
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    res.status(500).json({ message: 'Resim silinirken hata oluştu', error: error.message });
  }
});

// ✅ Debug endpoint
router.get('/debug', (req, res) => {
  const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  
  res.json({
    message: 'Cloudinary Image Service',
    cloudinaryConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT_SET',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT_SET',
    folder: 'projearna_uploads',
    status: cloudinaryConfigured ? 'READY' : 'MISSING_CONFIG'
  });
});

module.exports = router;
