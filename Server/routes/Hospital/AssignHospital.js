const express = require('express');
const router = express.Router();
const { assignAdminToHospital } = require('../../Controllers/Hospital/AssignHospital');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only superadmin can assign admins to hospitals
router.post('/assign-admin', verifyTokenAndRole(['superadmin']), assignAdminToHospital);

module.exports = router;
