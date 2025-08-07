const express = require('express');
const router = express.Router();
const { createPatient, updatePatient, deletePatient, getPatient, getAllPatients } = require('../../Controllers/Reception/Patient');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Allow receptionist and superadmin to manage patients
router.post('/create', verifyTokenAndRole(['admin', 'receptionist', 'superadmin']), createPatient);
router.put('/update', verifyTokenAndRole(['admin', 'receptionist', 'superadmin']), updatePatient);
router.delete('/delete', verifyTokenAndRole(['admin', 'receptionist', 'superadmin']), deletePatient);
router.get('/get/:id', verifyTokenAndRole(['admin', 'receptionist', 'superadmin']), getPatient);
router.get('/getall', verifyTokenAndRole(['admin', 'receptionist', 'superadmin']), getAllPatients);



// Patient visit/payment history
router.get('/:id/history', verifyTokenAndRole(['admin', 'receptionist', 'superadmin']), require('../../Controllers/Reception/Patient').getPatientHistory);

module.exports = router;
