const Student = require('../models/Student');
const User = require('../models/User');
const pool = require('../config/db');

// Helper function to sanitize null values
const sanitizeNullValues = (obj) => {
  if (!obj) return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === 'null') {
      sanitized[key] = undefined;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeNullValues(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Create or update student profile
exports.createOrUpdateStudent = async (req, res) => {
    try {
        const userId = req.user.id;  // From auth middleware
        
        // Validate required fields
        if (!req.body.username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username is required' 
            });
        }

        // Check if username is already taken by another user
        const existingStudent = await Student.findOne({ 
            where: { username: req.body.username } 
        });
        
        if (existingStudent && existingStudent.userId !== userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username is already taken' 
            });
        }

        console.log('📥 Received student profile data:', {
            coverPicUrl: req.body.coverPicUrl,
            profilePicUrl: req.body.profilePicUrl,
            username: req.body.username
        });
        
        const studentData = {
            userId,
            fullName: req.body.fullName || null,
            username: req.body.username.trim().toLowerCase(),
            phone: req.body.phone || null,
            coverPicUrl: req.body.coverPicUrl || null,
            profession: req.body.profession || 'Student',
            gender: req.body.gender || null,
            bio: req.body.bio || null,
            location: req.body.location || null,
            websiteUrl: req.body.websiteUrl || null,
            interests: Array.isArray(req.body.interests) ? req.body.interests : [],
            education: Array.isArray(req.body.education) ? req.body.education : [],
            professionalSkills: Array.isArray(req.body.professionalSkills) ? req.body.professionalSkills : [],
            certificates: Array.isArray(req.body.certificates) ? req.body.certificates : []
        };
        
        console.log('💾 Saving student with coverPicUrl:', studentData.coverPicUrl);

        let student = await Student.findOne({ where: { userId } });
        let isNew = false;
        
        if (student) {
            // Update existing
            student = await student.update(studentData);
        } else {
            // Create new
            student = await Student.create(studentData);
            isNew = true;
        }

        // Update users table with profession, username, and profile picture for persistence
        await User.updateMetadata(userId, {
            profession: 'Student',
            username: req.body.username.trim().toLowerCase()
        });
        
        // Update profile picture in users table if provided
        if (req.body.profilePicUrl) {
            await User.update(userId, {
                profile_picture: req.body.profilePicUrl
            });
        }

        // Get updated user details
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture, profession, username FROM users WHERE id = $1', 
            [userId]
        );
        const user = userResult.rows[0];

        const responseData = sanitizeNullValues({
            ...student.toJSON(),
            user: user || null
        });

        res.status(isNew ? 201 : 200).json({ 
            success: true, 
            message: isNew ? 'Student profile created successfully' : 'Student profile updated successfully',
            data: responseData
        });
    } catch (error) {
        console.error('Student profile error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get student profile by username
exports.getStudentByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const student = await Student.findOne({
            where: { username }
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const responseData = sanitizeNullValues(student.toJSON());
        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get my student profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const student = await Student.findOne({ where: { userId } });
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student profile not found' 
            });
        }
        
        // Get user details for profile picture
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];
        
        const studentData = student.toJSON();
        console.log('📤 Student profile data being sent:', {
            coverPicUrl: studentData.coverPicUrl,
            profilePicUrl: user?.profile_picture
        });
        
        const responseData = sanitizeNullValues({
            ...studentData,
            profilePicUrl: user?.profile_picture || null,
            user: user || null
        });

        res.status(200).json({ 
            success: true, 
            data: responseData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete my student profile
exports.deleteMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const student = await Student.findOne({ where: { userId } });
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student profile not found' 
            });
        }
        
        await student.destroy();
        res.status(200).json({ 
            success: true, 
            message: 'Student profile deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};