const express = require('express');
const router = express.Router();
const { addStaff, getStaff, getAllStaffSuperadmin } = require('../../Controllers/Hospital/Staff');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only admin can add/get staff for their hospital
router.post('/add', verifyTokenAndRole(['admin', 'superadmin']), addStaff);
router.get('/getall', verifyTokenAndRole(['admin']), getStaff);

// Superadmin gets all staff from all hospitals
router.get('/getall/superadmin', verifyTokenAndRole(['superadmin']), getAllStaffSuperadmin);

// Edit staff (admin of hospital or superadmin)
router.put('/edit', verifyTokenAndRole(['admin', 'superadmin']), require('../../Controllers/Hospital/Staff').editStaff);
// Delete staff (admin of hospital or superadmin)
router.delete('/delete', verifyTokenAndRole(['admin', 'superadmin']), require('../../Controllers/Hospital/Staff').deleteStaff);

module.exports = router;
