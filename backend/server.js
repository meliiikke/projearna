const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');
const heroSlidesRoutes = require('./routes/heroSlides');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// HTTPS enforcement - Railway için
app.use((req, res, next) => {
  // Railway'de HTTPS kullanımını zorla
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Rate limiting (gevşetilmiş development için)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  skip: (req) => {
    // Development'ta localhost'u skip et
    return req.ip === '127.0.0.1' || req.ip === '::1';
  }
});
app.use(limiter);

// CORS ayarları - Railway için ultra agresif
app.use(cors({
  origin: function (origin, callback) {
    // Tüm origin'lere izin ver (Railway için)
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["*"],
  exposedHeaders: ["*"],
  credentials: false,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400
}));

// CORS error handling
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  next(err);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// uploads klasörünü public yap - Railway için ultra agresif CORS
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    // Ultra agresif CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Expose-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("Access-Control-Max-Age", "86400");
    
    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Cache headers
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("ETag", `"${Date.now()}"`);
    
    // Content-Type'ı doğru şekilde ayarla
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (filePath.endsWith('.png')) {
      res.setHeader("Content-Type", "image/png");
    } else if (filePath.endsWith('.gif')) {
      res.setHeader("Content-Type", "image/gif");
    } else if (filePath.endsWith('.webp')) {
      res.setHeader("Content-Type", "image/webp");
    } else if (filePath.endsWith('.avif')) {
      res.setHeader("Content-Type", "image/avif");
    }
  }
}));

// Pre-flight OPTIONS requests için
app.options('*', cors());

// OPTIONS request'leri için özel handling - Railway için ultra agresif
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');
    res.header('Vary', 'Origin');
    res.status(200).end();
    return;
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ARNA Energy API is running',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 ARNA Energy Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔑 Default Admin Login: username=admin, password=admin123`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using default'}`);
      console.log(`🗄️ Database: ${process.env.DB_NAME || 'arna_energy'} on ${process.env.DB_HOST || 'localhost'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
