const Teacher = require('../models/Teacher');
const User = require('../models/User');
const pool = require('../config/db');

// Create or update teacher profile (linked to authenticated user)
exports.createOrUpdateTeacher = async (req, res) => {
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
        const existingTeacher = await Teacher.findOne({ 
            where: { username: req.body.username } 
        });
        
        if (existingTeacher && existingTeacher.userId !== userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username is already taken' 
            });
        }

        const teacherData = {
            userId,
            username: req.body.username.trim().toLowerCase(),
            coverPicUrl: req.body.coverPicUrl || null,
            profession: req.body.profession || 'Teacher',
            gender: req.body.gender || null,
            bio: req.body.bio || null,
            location: req.body.location || null,
            websiteUrl: req.body.websiteUrl || null,
            interests: Array.isArray(req.body.interests) ? req.body.interests : [],
            education: Array.isArray(req.body.education) ? req.body.education : [],
            professionalSkills: Array.isArray(req.body.professionalSkills) ? req.body.professionalSkills : [],
            certificates: Array.isArray(req.body.certificates) ? req.body.certificates : []
        };

        let teacher = await Teacher.findOne({ where: { userId } });
        let isNew = false;
        
        if (teacher) {
            // Update existing
            teacher = await teacher.update(teacherData);
        } else {
            // Create new
            teacher = await Teacher.create(teacherData);
            isNew = true;
        }

        // Get user details
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture FROM users WHERE id = $1', 
            [userId]
        );
        const user = userResult.rows[0];

        res.status(isNew ? 201 : 200).json({ 
            success: true, 
            message: isNew ? 'Teacher profile created successfully' : 'Teacher profile updated successfully',
            data: {
                ...teacher.toJSON(),
                user: user || null
            }
        });
    } catch (error) {
        console.error('Teacher profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get teacher profile by username
exports.getTeacherByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const teacher = await Teacher.findOne({
            where: { username: username.toLowerCase() }
        });
        
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                error: 'Teacher not found' 
            });
        }
        
        // Get user details from pg pool
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture FROM users WHERE id = $1', 
            [teacher.userId]
        );
        const user = userResult.rows[0];
        
        res.status(200).json({ 
            success: true, 
            data: {
                ...teacher.toJSON(),
                user: user || null
            }
        });
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get all teachers with optional filters
exports.getAllTeachers = async (req, res) => {
    try {
        const { profession, location, limit = 50, offset = 0 } = req.query;
        
        const whereClause = {};
        if (profession) whereClause.profession = profession;
        if (location) whereClause.location = { [require('sequelize').Op.iLike]: `%${location}%` };
        
        const teachers = await Teacher.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        
        // Get user details for all teachers
        const teachersWithUsers = await Promise.all(
            teachers.map(async (teacher) => {
                const userResult = await pool.query(
                    'SELECT id, full_name, email, profile_picture FROM users WHERE id = $1',
                    [teacher.userId]
                );
                return {
                    ...teacher.toJSON(),
                    user: userResult.rows[0] || null
                };
            })
        );
        
        res.status(200).json({ 
            success: true, 
            count: teachersWithUsers.length,
            data: teachersWithUsers 
        });
    } catch (error) {
        console.error('Get all teachers error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get authenticated user's teacher profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const teacher = await Teacher.findOne({ where: { userId } });
        
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                error: 'Teacher profile not found. Please create one first.' 
            });
        }
        
        // Get user details
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];
        
        res.status(200).json({ 
            success: true, 
            data: {
                ...teacher.toJSON(),
                user: user || null
            }
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Delete authenticated user's teacher profile
exports.deleteMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const teacher = await Teacher.findOne({ where: { userId } });
        
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                error: 'Teacher profile not found' 
            });
        }
        
        await teacher.destroy();
        
        res.status(200).json({ 
            success: true, 
            message: 'Teacher profile deleted successfully' 
        });
    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};