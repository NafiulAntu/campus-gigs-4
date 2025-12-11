const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', jobController.getJobs);
router.get('/categories', jobController.getCategories);
router.get('/locations', jobController.getLocations);

// Protected routes (require authentication) - specific routes before parameterized routes
router.get('/my/applications', protect, jobController.getMyApplications);
router.get('/my/posted', protect, jobController.getMyPostedJobs);
router.post('/', protect, jobController.createJob);
router.put('/:id', protect, jobController.updateJob);
router.delete('/:id', protect, jobController.deleteJob);
router.post('/:id/apply', protect, jobController.applyForJob);

// Parameterized route - must be last to avoid catching specific paths
router.get('/:id', jobController.getJobById);

module.exports = router;
