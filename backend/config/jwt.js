const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Extract token from request headers
const extractToken = (req) => {
  let token;
  
  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check cookies (if using cookies)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  return token;
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};