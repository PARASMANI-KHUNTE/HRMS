const express = require('express');
const router = express.Router();
const { 
    addDepartment, 
    updateDepartment, 
    deleteDepartment, 
    getDepartments, 
    getDepartmentsForAdmin 
} = require('../Controllers/Hospital/Department');
const { verifyTokenAndRole } = require('../Middleware/middleware');

// @route   GET /api/departments/admin/all
// @desc    Get all departments for the logged-in admin's hospital
// @access  Private (Admin)
router.get('/admin/all', verifyTokenAndRole(['admin']), getDepartmentsForAdmin);

// @route   POST /api/departments/add
// @desc    Add a new department
// @access  Private (Admin, Superadmin)
router.post('/add', verifyTokenAndRole(['admin', 'superadmin']), addDepartment);

// @route   PUT /api/departments/update
// @desc    Update a department
// @access  Private (Admin, Superadmin)
router.put('/update', verifyTokenAndRole(['admin', 'superadmin']), updateDepartment);

// @route   DELETE /api/departments/delete
// @desc    Delete a department
// @access  Private (Admin, Superadmin)
router.delete('/delete', verifyTokenAndRole(['admin', 'superadmin']), deleteDepartment);

// @route   GET /api/departments/getall
// @desc    Get all departments (global)
// @access  Private (Admin, Superadmin)
router.get('/getall', verifyTokenAndRole(['admin', 'superadmin']), getDepartments);

module.exports = router;
