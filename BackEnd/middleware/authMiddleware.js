const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Protect routes - verify JWT or Firebase token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Try Firebase token first
      try {
        const decodedFirebaseToken = await admin.auth().verifyIdToken(token);
        
        // Find user by Firebase UID
        req.user = await User.findByFirebaseUid(decodedFirebaseToken.uid);
        
        // If user doesn't exist, create them from Firebase data
        if (!req.user) {
          const firebaseUser = await admin.auth().getUser(decodedFirebaseToken.uid);
          
          req.user = await User.upsertFirebaseUser({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            profile_picture: firebaseUser.photoURL || null,
            profession: null,
            username: null
          });
        }

        delete req.user.password;
        return next();
      } catch (firebaseError) {
        // If Firebase token fails, try JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
          return res.status(401).json({ message: 'User not found' });
        }

        delete req.user.password;
        return next();
      }
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
      delete req.user?.password;
    } catch (error) {
      // Continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
