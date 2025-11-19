const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');

// Authentication routes for signin and signup
router.post('/signup', signup);
router.post('/signin', signin);

module.exports = router;