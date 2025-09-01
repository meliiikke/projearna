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

// CORS - Production ve development için
const corsOptions = {
  origin: function (origin, callback) {
    // Development'ta tüm origin'lere izin ver
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Environment variable'dan ek domain'ler eklenebilir
    const additionalOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : [];
    
    // Production'da izin verilen domain'ler
    const allowedOrigins = [
      'https://projearna-production.up.railway.app',
      'https://projearna-frontend-production.up.railway.app',
      'https://scintillating-panda-bbf94b.netlify.app',
      'https://projearna.netlify.app',
      ...additionalOrigins
    ];
    
    // Origin yoksa (mobile app, postman gibi) izin ver
    if (!origin) {
      return callback(null, true);
    }
    
    // Origin izin verilen listede mi kontrol et
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

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

// Static files for uploads (root klasördeki uploads klasörü)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Pre-flight OPTIONS requests için
app.options('*', cors());

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
