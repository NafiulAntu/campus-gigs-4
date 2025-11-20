const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { full_name, email, password, confirm_password, terms_agreed } = req.body;

    // Validation
    if (!full_name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
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

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
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
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error—please try again' });
  }
};

// Forgot Password - Generate reset token
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
      return res.json({ message: 'If email exists, reset link will be sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, return the token (you'll integrate email service later)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    res.json({
      message: 'If email exists, reset link will be sent',
      // Remove this in production - only for development
      resetLink: resetLink
    });
  } catch (error) {
    console.error('Forgot password error:', error);
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