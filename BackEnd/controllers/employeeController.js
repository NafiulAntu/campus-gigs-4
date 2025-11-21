const Employee = require('../models/Employee');

// Create or update employee profile
exports.createOrUpdateEmployee = async (req, res) => {
    try {
        const userId = req.user.id;  // From auth middleware
        const employeeData = {
            userId,
            fullName: req.body.fullName,
            username: req.body.username,
            profilePicUrl: req.body.profilePicUrl,
            coverPicUrl: req.body.coverPicUrl,
            profession: req.body.profession || 'Employee',
            gender: req.body.gender,
            bio: req.body.bio,
            location: req.body.location,
            websiteUrl: req.body.websiteUrl,
            interests: req.body.interests || [],
            education: req.body.education || [],
            professionalSkills: req.body.professionalSkills || [],
            certificates: req.body.certificates || []
        };

        let employee = await Employee.findOne({ where: { userId } });
        if (employee) {
            employee = await employee.update(employeeData);
        } else {
            employee = await Employee.create(employeeData);
        }

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        
        res.status(200).json({ success: true, data: employee });
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