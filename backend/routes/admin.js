const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', adminController.adminLogin);
router.get('/dashboard', adminAuth, adminController.getDashboardStats);
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/users/:userId', adminAuth, adminController.deleteUser);
router.put('/users/:userId/status', adminAuth, adminController.toggleUserStatus);

module.exports = router;