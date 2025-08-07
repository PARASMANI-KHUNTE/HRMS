const express = require('express');
const router = express.Router();
const { createPayment, getPayment, getAllPayments } = require('../../Controllers/Reception/Payment');
const { verifyTokenAndRole } = require('../../Middleware/middleware');

// Only receptionist can manage payments
router.post('/create', verifyTokenAndRole(['receptionist']), createPayment);
router.get('/get/:id', verifyTokenAndRole(['receptionist', 'superadmin']), getPayment);
router.get('/getall', verifyTokenAndRole(['receptionist', 'superadmin']), getAllPayments);

// Payment refund
router.post('/refund', verifyTokenAndRole(['receptionist', 'accountant', 'superadmin']), require('../../Controllers/Reception/PaymentRefund').refundPayment);

module.exports = router;
