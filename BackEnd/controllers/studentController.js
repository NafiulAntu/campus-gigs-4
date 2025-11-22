const Student = require('../models/Student');
const User = require('../models/User');
const pool = require('../config/db');

// Create or update student profile
exports.createOrUpdateStudent = async (req, res) => {
    try {
        const userId = req.user.id;  // From auth middleware
        const studentData = {
            userId,
            fullName: req.body.fullName,
            username: req.body.username,
            phone: req.body.phone || null,
            profilePicUrl: req.body.profilePicUrl,
            coverPicUrl: req.body.coverPicUrl,
            profession: req.body.profession || 'Student',
            gender: req.body.gender,
            bio: req.body.bio,
            location: req.body.location,
            websiteUrl: req.body.websiteUrl,
            interests: req.body.interests || [],
            education: req.body.education || [],
            professionalSkills: req.body.professionalSkills || [],
            certificates: req.body.certificates || []
        };

        let student = await Student.findOne({ where: { userId } });
        let isNew = false;
        if (student) {
            student = await student.update(studentData);
        } else {
            student = await Student.create(studentData);
            isNew = true;
        }

        // Update users table with profession and username
        await User.updateMetadata(userId, {
            profession: 'Student',
            username: req.body.username
        });
        
        // Update profile picture in users table if provided
        if (req.body.profilePicUrl) {
            await User.update(userId, {
                profile_picture: req.body.profilePicUrl
            });
        }

        // Get updated user details to return with profile picture
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture, profession, username FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        res.status(200).json({ 
            success: true, 
            message: isNew ? 'Student profile created successfully' : 'Student profile updated successfully',
            data: {
                ...student.toJSON(),
                user: user || null
            }
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
        res.status(200).json({ success: true, data: student });
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
        
        res.status(200).json({ success: true, data: student });
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