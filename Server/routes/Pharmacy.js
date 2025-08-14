const express = require('express');
const router = express.Router();
const { verifyTokenAndRole } = require('../Middleware/middleware');
const pharmacyController = require('../Controllers/Pharmacy');

// Define the roles that can access this module
const authorizedRoles = ['pharmacist', 'superadmin', 'admin'];

// --- Inventory Routes ---
// Add a new medicine
router.post('/medicines', verifyTokenAndRole(authorizedRoles), pharmacyController.addMedicine);

// Get all medicines
router.get('/medicines', verifyTokenAndRole(authorizedRoles), pharmacyController.getMedicines);

// Update a medicine
router.put('/medicines/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.updateMedicine);

// Delete a medicine
router.delete('/medicines/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.deleteMedicine);

// Low stock medicines
router.get('/medicines/low-stock', verifyTokenAndRole(authorizedRoles), pharmacyController.getLowStockMedicines);

// --- Invoice Routes ---
// Create a new invoice
router.post('/invoices/create', verifyTokenAndRole(authorizedRoles), pharmacyController.createInvoice);
// Alias to support client expecting POST /invoices
router.post('/invoices', verifyTokenAndRole(authorizedRoles), pharmacyController.createInvoice);

// Get all invoices
router.get('/invoices', verifyTokenAndRole(authorizedRoles), pharmacyController.getInvoices);

// Get a single invoice by ID
router.get('/invoices/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.getInvoiceById);

// --- Category Routes ---
router.post('/categories', verifyTokenAndRole(authorizedRoles), pharmacyController.createCategory);
router.get('/categories', verifyTokenAndRole(authorizedRoles), pharmacyController.getCategories);
router.put('/categories/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.updateCategory);
router.delete('/categories/:id', verifyTokenAndRole(authorizedRoles), pharmacyController.deleteCategory);

// --- Purchase Routes ---
router.post('/purchases', verifyTokenAndRole(authorizedRoles), pharmacyController.createPurchase);

// --- Return Routes ---
// Create a new return
router.post('/returns/create', verifyTokenAndRole(authorizedRoles), pharmacyController.createReturn);
// Alias to support client expecting POST /returns
router.post('/returns', verifyTokenAndRole(authorizedRoles), pharmacyController.createReturn);

// Get all returns
router.get('/returns', verifyTokenAndRole(authorizedRoles), pharmacyController.getReturns);

// --- Patients (Pharmacy-scoped lightweight search) ---
// Allow pharmacists to search patients within their hospital
router.get('/patients', verifyTokenAndRole(authorizedRoles), pharmacyController.getPharmacyPatients);

// --- Dashboard Routes ---
router.get('/dashboard-stats', verifyTokenAndRole(['pharmacist', 'admin', 'superadmin']), pharmacyController.getDashboardStats);

module.exports = router;
