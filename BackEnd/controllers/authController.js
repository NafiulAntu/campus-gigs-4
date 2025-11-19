const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Signup Controller
exports.signup = async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body);
    const { full_name, email, password, confirm_password, terms_agreed } = req.body;

    // Validation
    if (!full_name || !email || !password || !confirm_password) {
      console.log('❌ Validation failed: Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirm_password) {
      console.log('❌ Validation failed: Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!terms_agreed) {
      console.log('❌ Validation failed: Terms not agreed');
      return res.status(400).json({ message: 'You must agree to terms' });
    }

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with terms_agreed
    console.log('📥 Creating user in database...');
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      terms_agreed: true,
      provider: 'local'
    });
    console.log('✅ User created successfully:', user.id);

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
    const { email, password } = req.body;

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

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
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