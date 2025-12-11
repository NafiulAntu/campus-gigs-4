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

      // Try Firebase token first (if Firebase Admin SDK is initialized)
      try {
        if (admin.apps.length > 0) {
          const decodedFirebaseToken = await admin.auth().verifyIdToken(token);
          
          // Find user by Firebase UID
          req.user = await User.findByFirebaseUid(decodedFirebaseToken.uid);
          
          // If user doesn't exist, create them from Firebase data
          if (!req.user) {
            console.log('User not found, creating from Firebase data...');
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
        } else {
          // Firebase Admin not initialized, try JWT
          console.log('Firebase Admin not initialized, trying JWT...');
          throw new Error('Firebase Admin not initialized');
        }
      } catch (firebaseError) {
        // If Firebase token fails, try JWT
        console.log('Firebase verification failed:', firebaseError.message);
        try {
          const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
          req.user = await User.findById(decoded.id);
          
          if (!req.user) {
            console.error('JWT verified but user not found');
            return res.status(401).json({ message: 'User not found' });
          }

          console.log('JWT verified for user ID:', req.user.id);
          delete req.user.password;
          return next();
        } catch (jwtError) {
          console.error('Both Firebase and JWT verification failed');
          console.error('Firebase error:', firebaseError.message);
          console.error('JWT error:', jwtError.message);
          throw jwtError;
        }
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
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      req.user = await User.findById(decoded.id);
      delete req.user?.password;
    } catch (error) {
      // Continue without user
      req.user = null;
    }
  }

  next();
};

// Admin only middleware
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    console.log(`✅ Admin access granted: ${req.user.email} (${req.user.role})`);
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authorization check failed' 
    });
  }
};

// Super admin only middleware
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Super admin access required' 
      });
    }

    console.log(`✅ Super admin access granted: ${req.user.email}`);
    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authorization check failed' 
    });
  }
};

module.exports = { protect, optionalAuth, requireAdmin, requireSuperAdmin };
