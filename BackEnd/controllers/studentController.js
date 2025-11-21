const Student = require('../models/Student');
const User = require('../models/User');

// Create or update student profile
exports.createOrUpdateStudent = async (req, res) => {
    try {
        const userId = req.user.id;  // From auth middleware
        const studentData = {
            userId,
            fullName: req.body.fullName,
            username: req.body.username,
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
        if (student) {
            student = await student.update(studentData);
        } else {
            student = await Student.create(studentData);
        }

        // Update users table with profession and username
        await User.updateMetadata(userId, {
            profession: 'Student',
            username: req.body.username
        });

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ error: error.message });
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