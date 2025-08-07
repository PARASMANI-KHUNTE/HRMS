const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, deleteProduct, getProduct, getAllProducts } = require('../../Controllers/Pharmacy/Product');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only pharmacist or superadmin can manage inventory
router.post('/create', verifyTokenAndRole(['pharmacist', 'superadmin']), createProduct);
router.put('/update', verifyTokenAndRole(['pharmacist', 'superadmin']), updateProduct);
router.delete('/delete', verifyTokenAndRole(['pharmacist', 'superadmin']), deleteProduct);
router.get('/get/:id', verifyTokenAndRole(['pharmacist', 'superadmin']), getProduct);
router.get('/getall', verifyTokenAndRole(['pharmacist', 'superadmin']), getAllProducts);

module.exports = router;
