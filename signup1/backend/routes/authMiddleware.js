const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      console.warn('⚠️ No token provided');
      return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }
  
  
  
    jwt.verify(token, JWT_SECRET, (err, worker) => {
      if (err) {
        console.error('❌ JWT Verification Error:', err.message);
        return res.status(403).json({ message: 'Access Denied: Invalid Token!' });
      }
  
      console.log('✅ Token verified. Worker ID:', worker.id);
      console.log('Decoded token:', worker);

      req.worker = worker;
      next();
    });
  }
  module.exports = authenticateToken;