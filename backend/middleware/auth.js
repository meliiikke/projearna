const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Check both Authorization header and x-auth-token header
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      token = req.header('x-auth-token');
    }

    console.log('🔐 Auth middleware - Token check:', {
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 20) + '...' : 'null',
      headers: {
        authorization: req.header('Authorization'),
        xAuthToken: req.header('x-auth-token')
      }
    });

    if (!token) {
      console.log('❌ No token found in headers');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production');
    
    // Check if user still exists
    const [rows] = await pool.execute('SELECT id, username, email FROM admins WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
