const express = require('express');
const router = express.Router();
const { assignDepartment } = require('../../Controllers/Hospital/DepartmentAssign');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only admin of hospital or superadmin can assign departments to staff
router.post('/assign', verifyTokenAndRole(['admin', 'superadmin']), assignDepartment);

module.exports = router;
