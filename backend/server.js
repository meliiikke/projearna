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

// ✅ Allowed Origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://arnasitesi.netlify.app'
];

// ✅ CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman, curl, server-to-server
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.netlify.app')
    ) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ Preflight (OPTIONS) fix
app.options('*', cors(corsOptions));

// ✅ Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// ✅ Force HTTPS (only production, GET/HEAD)
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

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use(limiter);

// ✅ Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api', imageRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ARNA Energy API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend connection test successful',
    timestamp: new Date().toISOString()
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }

  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// ✅ Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting ARNA Energy Backend Server...');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
