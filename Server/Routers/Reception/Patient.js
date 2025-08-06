const express = require('express');
const router = express.Router();
const { createPatient, updatePatient, deletePatient, getPatient, getAllPatients } = require('../../Controllers/Reception/Patient');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Allow receptionist and superadmin to manage patients
router.post('/create', verifyTokenAndRole(['receptionist', 'superadmin']), createPatient);
router.put('/update', verifyTokenAndRole(['receptionist', 'superadmin']), updatePatient);
router.delete('/delete', verifyTokenAndRole(['receptionist', 'superadmin']), deletePatient);
router.get('/get/:id', verifyTokenAndRole(['receptionist', 'superadmin']), getPatient);
router.get('/getall', verifyTokenAndRole(['receptionist', 'superadmin']), getAllPatients);



// Patient visit/payment history
router.get('/:id/history', verifyTokenAndRole(['receptionist', 'superadmin']), require('../../Controllers/Reception/Patient').getPatientHistory);

module.exports = router;
