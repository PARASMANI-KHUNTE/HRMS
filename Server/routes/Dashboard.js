const express = require('express');
const router = express.Router();
const { verifyTokenAndRole } = require('../Middleware/middleware');
const { getDashboardStats, getReportData } = require('../Controllers/DashboardController');

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Superadmin)
router.get('/stats', verifyTokenAndRole(['superadmin']), getDashboardStats);

// @route   GET api/dashboard/report-data
// @desc    Get aggregated data for reports
// @access  Private (Superadmin)
router.get('/report-data', verifyTokenAndRole(['superadmin']), getReportData);

module.exports = router;
