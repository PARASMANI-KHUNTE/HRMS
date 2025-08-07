const express = require('express');
const router = express.Router();
const {
    createPharmacyInvoice,
    updatePharmacyInvoice,
    deletePharmacyInvoice,
    getPharmacyInvoice,
    getAllPharmacyInvoices,
    returnPharmacyInvoice
} = require('../../Controllers/Pharmacy/Invoice');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only pharmacist or superadmin can manage pharmacy invoices
router.post('/create', verifyTokenAndRole(['pharmacist', 'superadmin']), createPharmacyInvoice);
router.put('/update', verifyTokenAndRole(['pharmacist', 'superadmin']), updatePharmacyInvoice);
router.delete('/delete', verifyTokenAndRole(['pharmacist', 'superadmin']), deletePharmacyInvoice);
router.get('/get/:id', verifyTokenAndRole(['pharmacist', 'superadmin']), getPharmacyInvoice);
router.get('/getall', verifyTokenAndRole(['pharmacist', 'superadmin']), getAllPharmacyInvoices);
// Return/refund endpoint
router.post('/return', verifyTokenAndRole(['pharmacist', 'superadmin']), returnPharmacyInvoice);

module.exports = router;
