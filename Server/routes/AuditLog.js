const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../Controllers/AuditLogController');
const { verifyTokenAndRole } = require('../Middleware/middleware');

// @route   GET api/audit-logs
// @desc    Get all audit logs
// @access  Private (Superadmin only)
router.get('/', verifyTokenAndRole(['superadmin']), getAuditLogs);

module.exports = router;
