const express = require('express');
const router = express.Router();
const { addDepartment, updateDepartment, deleteDepartment, getDepartments } = require('../../Controllers/Hospital/Department');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only admin of hospital or superadmin can manage departments
router.post('/add', verifyTokenAndRole(['admin', 'superadmin']), addDepartment);
router.put('/update', verifyTokenAndRole(['admin', 'superadmin']), updateDepartment);
router.delete('/delete', verifyTokenAndRole(['admin', 'superadmin']), deleteDepartment);
router.get('/getall', verifyTokenAndRole(['admin', 'superadmin']), getDepartments);

module.exports = router;
