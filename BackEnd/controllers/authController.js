const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Signup Controller (Local Authentication with bcrypt)
// Note: This endpoint is for backend-managed authentication
// Firebase users use Firebase Authentication and have password = NULL in the database
exports.signup = async (req, res) => {
  try {
    const { full_name, email, password, confirm_password, terms_agreed } = req.body;

    // Validation
    if (!full_name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only valid Gmail addresses are allowed for registration' });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid Gmail address format' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!terms_agreed) {
      return res.status(400).json({ message: 'You must agree to terms' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with terms_agreed
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      terms_agreed: true,
      provider: 'local'
    });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        profile_picture: user.profile_picture || null,
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// Signin Controller
exports.signin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only valid Gmail addresses are allowed' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', { email: user.email, hasPassword: !!user.password, passwordType: typeof user.password });

    // Check if password exists and is valid
    if (!user.password || typeof user.password !== 'string') {
      console.log('Password validation failed:', { password: user.password, type: typeof user.password });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token with extended expiration if rememberMe is true
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: tokenExpiry,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        profession: user.profession,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        profile_picture: user.profile_picture,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// Forgot Password - Generate and send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, OTP will be sent' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // In production, send OTP via email
    // For now, log it to console for testing
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);

    res.json({
      message: 'OTP sent to your email',
      // Remove this in production - only for development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if OTP exists
    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Check attempts (max 5)
    if (stored.attempts >= 5) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (stored.otp !== otp) {
      stored.attempts++;
      return res.status(400).json({ 
        message: `Invalid OTP. ${5 - stored.attempts} attempts remaining.` 
      });
    }

    // OTP verified - generate reset token
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Delete OTP after successful verification
    otpStore.delete(email);

    res.json({
      message: 'OTP verified successfully',
      token: resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If email exists, OTP will be sent' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    console.log(`\n🔐 New OTP for ${email}: ${otp}\n`);

    res.json({
      message: 'New OTP sent to your email',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// Reset Password - Update password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.purpose !== 'password-reset') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.updatePassword(user.id, hashedPassword);

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// OAuth Callback Handler
exports.oauthCallback = async (req, res) => {
  try {
    // User is attached by passport
    const user = req.user;

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      full_name: user.full_name,
      email: user.email
    }))}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// Delete Account Controller
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    console.log('Delete account request for userId:', userId);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User found:', user.email, 'Provider:', user.provider);

    // Verify password for local accounts
    if (user.provider === 'local') {
      if (!password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password is required to delete account' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Incorrect password' 
        });
      }
      console.log('Password verified successfully');
    }

    // Delete ALL related data first to avoid foreign key constraints
    const pool = require('../config/db');
    
    console.log('🗑️ Starting comprehensive data deletion for user:', userId);
    
    const deleteOperations = [
      { query: 'DELETE FROM teachers WHERE user_id = $1', name: 'teacher profile' },
      { query: 'DELETE FROM students WHERE user_id = $1', name: 'student profile' },
      { query: 'DELETE FROM employees WHERE user_id = $1', name: 'employee profile' },
      { query: 'DELETE FROM verification_requests WHERE user_id = $1', name: 'verification requests' },
      { query: 'DELETE FROM posts WHERE posted_by = $1', name: 'posts' },
      { query: 'DELETE FROM followers WHERE follower_id = $1 OR following_id = $1', name: 'follower relationships' },
      { query: 'DELETE FROM notifications WHERE user_id = $1 OR actor_id = $1', name: 'notifications' },
      { query: 'DELETE FROM user_transactions WHERE sender_id = $1 OR receiver_id = $1', name: 'transactions' },
      { query: 'DELETE FROM subscriptions WHERE user_id = $1', name: 'subscriptions' },
      { query: 'DELETE FROM payment_transactions WHERE user_id = $1', name: 'payment transactions' },
      { query: 'DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', name: 'messages' },
      { query: 'DELETE FROM payments WHERE user_id = $1', name: 'payments' }
    ];

    for (const operation of deleteOperations) {
      try {
        const result = await pool.query(operation.query, [userId]);
        if (result.rowCount > 0) {
          console.log(`✅ Deleted ${result.rowCount} ${operation.name}`);
        }
      } catch (err) {
        // Table might not exist or other error - continue anyway
        console.log(`⚠️ Skipped ${operation.name}: ${err.message}`);
      }
    }
    
    console.log('✅ All related data deletion completed');

    // Finally delete the user
    const deletedUser = await User.delete(userId);
    console.log('User deleted successfully:', deletedUser);

    res.status(200).json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account. Please try again.',
      error: error.message
    });
  }
};

// Firebase Sync Controller - Sync Firebase authenticated user with PostgreSQL
exports.firebaseSync = async (req, res) => {
  try {
    const { firebase_uid, uid, email, full_name, displayName, username, profession, profile_picture, photoURL } = req.body;
    
    // Accept either firebase_uid or uid (frontend sends uid)
    const firebaseUid = firebase_uid || uid;
    const name = full_name || displayName;
    
    // Validate required fields
    if (!firebaseUid || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Firebase UID and email are required' 
      });
    }

    // Use photoURL if profile_picture not provided (for Firebase compatibility)
    const finalProfilePicture = profile_picture || photoURL;

    // Find or create user by Firebase UID
    let user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      // Create new user from Firebase data
      console.log('Creating new user from Firebase data:', { firebaseUid, email, name });
      user = await User.upsertFirebaseUser({
        firebase_uid: firebaseUid,
        email,
        full_name: name || email.split('@')[0],
        profile_picture: finalProfilePicture,
        profession: profession || null,
        username: username || null
      });
      console.log('User created with ID:', user.id);
    } else {
      // Update existing user metadata if provided
      if (username || profession || finalProfilePicture) {
        console.log('Updating existing user metadata:', user.id);
        user = await User.updateMetadata(user.id, {
          username,
          profession,
          profile_picture: finalProfilePicture
        });
      }
    }

    // Generate JWT token for this user
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      token, // Return JWT token for future requests
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        profession: user.profession,
        profile_picture: user.profile_picture,
        firebase_uid: user.firebase_uid
      }
    });

  } catch (error) {
    console.error('Firebase sync error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync user data',
      error: error.message
    });
  }
};