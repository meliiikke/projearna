const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const imageRoutes = require('./routes/image');
const heroSlidesRoutes = require('./routes/heroSlides');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use((req, res, next) => {
    if (
      req.header('x-forwarded-proto') !== 'https' &&
      process.env.NODE_ENV === 'production' &&
      (req.method === 'GET' || req.method === 'HEAD')
    ) {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
  
// Rate limiting - daha esnek ayarlar
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10000, // 15 dakikada 10000 istek (çok daha yüksek)
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use(limiter);

// ✅ CORS whitelist
const allowedOrigins = [
    'http://localhost:3000',
    'https://arnasitesi.netlify.app'
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Eğer Postman / server-to-server gibi origin yoksa da izin verelim
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
  }));

// Pre-flight OPTIONS handler - PRODUCTION

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api', imageRoutes); 
app.use('/api/hero-slides', heroSlidesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ARNA Energy API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connection test successful',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }

  console.error('❌ Server Error:', err.stack);
  console.error('Request details:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting ARNA Energy Backend Server...');
    console.log('📊 Environment:', process.env.NODE_ENV || 'development');
    console.log('🗄️ Database config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'arna_energy',
      user: process.env.DB_USER || 'root'
    });
    
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ ARNA Energy Backend Server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔑 Default Admin Login: username=admin, password=admin123`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using default'}`);
      console.log(`🗄️ Database: ${process.env.DB_NAME || 'arna_energy'} on ${process.env.DB_HOST || 'localhost'}`);
      console.log(`🌍 CORS: All origins allowed`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    process.exit(1);
  }
};

startServer();

module.exports = app;
