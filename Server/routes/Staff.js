const express = require('express');
const router = express.Router();
const { getStaffByHospital, addStaff, editStaff, deleteStaff, getStaffForAdmin } = require('../Controllers/Staff');
const { verifyTokenAndRole } = require('../Middleware/middleware');

// Middleware to protect all staff routes
router.use(verifyTokenAndRole(['admin', 'superadmin']));

// Route for an admin to get all staff in their own hospital
router.get('/admin/all', verifyTokenAndRole(['admin']), getStaffForAdmin);

// Route to get staff by hospital (for Admins)
router.get('/by-hospital/:hospitalId', getStaffByHospital);

// Route for an admin to get all staff in their own hospital
router.get('/admin/all', verifyTokenAndRole(['admin']), getStaffForAdmin);

// Routes for Superadmin/Admin to manage staff
router.post('/add', addStaff);
router.put('/edit', editStaff);
router.delete('/delete/:id', deleteStaff);

module.exports = router;
