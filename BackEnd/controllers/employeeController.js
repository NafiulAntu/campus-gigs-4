const Employee = require('../models/Employee');
const User = require('../models/User');
const pool = require('../config/db');

// Create or update employee profile
exports.createOrUpdateEmployee = async (req, res) => {
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
        const existingEmployee = await Employee.findOne({ 
            where: { username: req.body.username } 
        });
        
        if (existingEmployee && existingEmployee.userId !== userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username is already taken' 
            });
        }

        const employeeData = {
            userId,
            fullName: req.body.fullName || null,
            username: req.body.username.trim().toLowerCase(),
            phone: req.body.phone || null,
            coverPicUrl: req.body.coverPicUrl || null,
            profession: req.body.profession || 'Employee',
            gender: req.body.gender || null,
            bio: req.body.bio || null,
            location: req.body.location || null,
            websiteUrl: req.body.websiteUrl || null,
            interests: Array.isArray(req.body.interests) ? req.body.interests : [],
            education: Array.isArray(req.body.education) ? req.body.education : [],
            professionalSkills: Array.isArray(req.body.professionalSkills) ? req.body.professionalSkills : [],
            certificates: Array.isArray(req.body.certificates) ? req.body.certificates : []
        };

        let employee = await Employee.findOne({ where: { userId } });
        let isNew = false;
        
        if (employee) {
            // Update existing
            employee = await employee.update(employeeData);
        } else {
            // Create new
            employee = await Employee.create(employeeData);
            isNew = true;
        }

        // Update users table with profession, username, and profile picture for persistence
        await User.updateMetadata(userId, {
            profession: 'Employee',
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

        res.status(isNew ? 201 : 200).json({ 
            success: true,
            message: isNew ? 'Employee profile created successfully' : 'Employee profile updated successfully',
            data: {
                ...employee.toJSON(),
                user: user || null
            }
        });
    } catch (error) {
        console.error('Employee profile error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get employee profile by username
exports.getEmployeeByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const employee = await Employee.findOne({
            where: { username }
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get my employee profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const employee = await Employee.findOne({ where: { userId } });
        
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                error: 'Employee profile not found' 
            });
        }
        
        // Get user details for profile picture
        const { pool } = require('../config/db');
        const userResult = await pool.query(
            'SELECT id, full_name, email, profile_picture FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];
        
        res.status(200).json({ 
            success: true, 
            data: {
                ...employee.toJSON(),
                profilePicUrl: user?.profile_picture || null,
                user: user || null
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete my employee profile
exports.deleteMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const employee = await Employee.findOne({ where: { userId } });
        
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                error: 'Employee profile not found' 
            });
        }
        
        await employee.destroy();
        res.status(200).json({ 
            success: true, 
            message: 'Employee profile deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};