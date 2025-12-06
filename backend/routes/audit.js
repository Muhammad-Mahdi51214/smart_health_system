const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const adminAuth = require('../middleware/adminAuth');

router.get('/logs', adminAuth, auditController.getAuditLogs);
router.get('/user/:userId', adminAuth, auditController.getUserActivityLog);
router.get('/stats', adminAuth, auditController.getAuditStats);

module.exports = router;