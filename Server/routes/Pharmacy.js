const express = require('express');
const router = express.Router();
const { verifyTokenAndRole } = require('../Middleware/middleware');
const pharmacyController = require('../Controllers/Pharmacy');

// Define the roles that can access this module
const authorizedRoles = ['pharmacist', 'superadmin'];

// --- Inventory Routes ---
// Add a new medicine
router.post('/medicines', verifyTokenAndRole(authorizedRoles), pharmacyController.addMedicine);

// Get all medicines
router.get('/medicines', verifyTokenAndRole(authorizedRoles), pharmacyController.getMedicines);

// Update a medicine
router.put('/medicines/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.updateMedicine);

// Delete a medicine
router.delete('/medicines/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.deleteMedicine);

// --- Invoice Routes ---
// Create a new invoice
router.post('/invoices/create', verifyTokenAndRole(authorizedRoles), pharmacyController.createInvoice);

// Get all invoices
router.get('/invoices', verifyTokenAndRole(authorizedRoles), pharmacyController.getInvoices);

// Get a single invoice by ID
router.get('/invoices/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.getInvoiceById);

// --- Return Routes ---
// Create a new return
router.post('/returns/create', verifyTokenAndRole(authorizedRoles), pharmacyController.createReturn);

// Get all returns
router.get('/returns', verifyTokenAndRole(authorizedRoles), pharmacyController.getReturns);

// Dashboard route
router.get('/dashboard-stats', verifyTokenAndRole(['pharmacist', 'admin', 'superadmin']), pharmacyController.getDashboardStats);

module.exports = router;
