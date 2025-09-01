const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config();

const { initializeDatabase } = require('./backend/config/database');
const authRoutes = require('./backend/routes/auth');
const contentRoutes = require('./backend/routes/content');
const uploadRoutes = require('./backend/routes/upload');
const heroSlidesRoutes = require('./backend/routes/heroSlides');

const app = express();

// Railway'de proxy arkasında olduğumuz için trust proxy'i etkinleştir
app.set('trust proxy', 1);  // 1 = sadece bir proxy katmanına güven
const PORT = process.env.PORT || 3001;

// ✅ Proxy arkasında (Railway, Render, Vercel vb.) doğru IP algılaması için


// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Rate limiting (production için)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://scintillating-panda-bbf94b.netlify.app'
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  // Pre-flight OPTIONS
  app.options('*', cors());
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

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
      console.log(`🌐 API Base URL: https://projearna-production.up.railway.app/api`);
      console.log(`🔑 Default Admin Login: username=admin, password=admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
