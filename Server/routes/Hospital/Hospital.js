const express = require('express');
const router = express.Router();
const { createHospital, updateHospital, deleteHospital, assignDepartmentsToHospital } = require('../../Controllers/Hospital/Hospital');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only superadmin can manage hospitals
router.post('/create', verifyTokenAndRole(['superadmin']), createHospital);
router.put('/update', verifyTokenAndRole(['superadmin']), updateHospital);
router.delete('/delete', verifyTokenAndRole(['superadmin']), deleteHospital);

// Assign departments to a hospital
router.put('/assign-departments', verifyTokenAndRole(['superadmin']), assignDepartmentsToHospital);

// Get all hospitals
router.get('/getall', verifyTokenAndRole(['superadmin']), require('../../Controllers/Hospital/Hospital').getHospitals);
// Get hospital by id
router.get('/get/:id', verifyTokenAndRole(['superadmin']), require('../../Controllers/Hospital/Hospital').getHospital);

// Assign departments to a hospital
router.put('/assign-departments', verifyTokenAndRole(['superadmin']), assignDepartmentsToHospital);

module.exports = router;
