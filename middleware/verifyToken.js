const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid authentication token' });
      }
      // Token is valid
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyToken;
