const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = await User.findById(decoded.id).select('-password');

    
    next();
  } catch (error) {
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }

    
    return res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
};
