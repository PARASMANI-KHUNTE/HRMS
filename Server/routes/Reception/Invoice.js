const express = require('express');
const router = express.Router();
const { createInvoice, updateInvoice, deleteInvoice, getInvoice, getAllInvoices } = require('../../Controllers/Reception/Invoice');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Receptionist can create, superadmin and receptionist can manage
router.post('/create', verifyTokenAndRole(['receptionist']), createInvoice);
router.put('/update', verifyTokenAndRole(['receptionist', 'superadmin']), updateInvoice);
router.delete('/delete', verifyTokenAndRole(['receptionist', 'superadmin']), deleteInvoice);
router.get('/get/:id', verifyTokenAndRole(['receptionist', 'superadmin']), getInvoice);
router.get('/getall', verifyTokenAndRole(['receptionist', 'superadmin']), getAllInvoices);

// Invoice PDF generation
router.get('/pdf/:id', verifyTokenAndRole(['receptionist', 'superadmin']), require('../../Controllers/Reception/InvoicePDF').generateInvoicePDF);

module.exports = router;
