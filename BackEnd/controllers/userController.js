const User = require('../models/User');

// Helper function to sanitize null values
// Converts null or 'null' string to empty string for better frontend handling
const sanitizeNullValues = (obj) => {
  if (!obj) return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === 'null') {
      // Convert null to empty string for string fields, undefined for others
      sanitized[key] = '';
    } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      sanitized[key] = sanitizeNullValues(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Remove password from response but keep firebase_uid for messaging
    const { password, ...userWithoutPassword } = user;
    const sanitizedUser = sanitizeNullValues(userWithoutPassword);
    
    res.json({
      success: true,
      data: sanitizedUser
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: error.message 
    });
  }
};

// Create new user (not for signup, just admin user creation)
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, provider, provider_id, profile_picture } = req.body;
    
    // Validation
    if (!full_name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name and email are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }
    
    const user = await User.create({
      full_name,
      email,
      password,
      provider,
      provider_id,
      profile_picture
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user',
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, profile_picture } = req.body;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Update user
    const updatedUser = await User.update(id, {
      full_name,
      email,
      profile_picture
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user',
      error: error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Delete user
    await User.delete(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user',
      error: error.message 
    });
  }
};

// Get user by Firebase UID
exports.getUserByFirebaseUid = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    const sanitizedUser = sanitizeNullValues(userWithoutPassword);
    
    res.json({
      success: true,
      data: sanitizedUser
    });
  } catch (error) {
    console.error('Get user by Firebase UID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: error.message 
    });
  }
};

// Search users by username, full name, or email
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = q.trim().toLowerCase();
    const users = await User.search(searchTerm);
    
    // Remove passwords and sanitize
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return sanitizeNullValues(userWithoutPassword);
    });
    
    res.json({
      success: true,
      count: sanitizedUsers.length,
      data: sanitizedUsers
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching users',
      error: error.message 
    });
  }
};
