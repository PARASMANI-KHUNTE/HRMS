const express = require('express');
const router = express.Router();
const { sendTestEmail, sendTestSms, uploadTestFile } = require('../Controllers/ServicesController');
const { verifyTokenAndRole } = require('../Middleware/middleware');
const handleUpload = require('../Middleware/upload');

// All routes in this file will be protected and only accessible by admin or superadmin
router.use(verifyTokenAndRole(['admin', 'superadmin']));

// Route to send a test email
router.post('/send-email', sendTestEmail);

// Route to send a test SMS
router.post('/send-sms', sendTestSms);

// Route to upload a test file
// It uses the handleUpload middleware first to process the file
router.post('/upload-file', handleUpload, uploadTestFile);

module.exports = router;
