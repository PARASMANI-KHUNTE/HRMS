const express = require('express');
const router = express.Router();
const {
    createLabReport,
    updateLabReport,
    deleteLabReport,
    getLabReport,
    getAllLabReports,
    generateLabReportPDF
} = require('../../Controllers/Lab/Report');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only labtech, admin, or superadmin can manage lab reports
router.post('/create', verifyTokenAndRole(['labtech', 'admin', 'superadmin']), createLabReport);
router.put('/update', verifyTokenAndRole(['labtech', 'admin', 'superadmin']), updateLabReport);
router.delete('/delete', verifyTokenAndRole(['labtech', 'admin', 'superadmin']), deleteLabReport);
router.get('/get/:id', verifyTokenAndRole(['labtech', 'admin', 'superadmin']), getLabReport);
router.get('/getall', verifyTokenAndRole(['labtech', 'admin', 'superadmin']), getAllLabReports);
// Lab report PDF
router.get('/pdf/:id', verifyTokenAndRole(['labtech', 'admin', 'superadmin']), generateLabReportPDF);

module.exports = router;
