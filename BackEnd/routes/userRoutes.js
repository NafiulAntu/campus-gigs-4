const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User endpoints
router.get('/users', userController.getAllUsers);           // GET /api/users
router.get('/users/:id', userController.getUserById);       // GET /api/users/:id
router.post('/users', userController.createUser);           // POST /api/users
router.put('/users/:id', userController.updateUser);        // PUT /api/users/:id
router.delete('/users/:id', userController.deleteUser);     // DELETE /api/users/:id

module.exports = router;
