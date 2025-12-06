const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const adminAuth = require('../middleware/adminAuth');

router.post('/submit', contactController.submitMessage); // Public
router.get('/messages', adminAuth, contactController.getMessages);
router.put('/messages/:messageId/respond', adminAuth, contactController.respondToMessage);

module.exports = router;