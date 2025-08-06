const Payment = require('../../Models/Payment');

// Refund payment (receptionist or accountant)
const refundPayment = async (req, res) => {
    const { id, refundAmount, refundReason } = req.body;
    if (!id || typeof refundAmount !== 'number') {
        return res.status(400).json({ message: 'id and refundAmount are required.' });
    }
    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        if (payment.isRefunded) {
            return res.status(400).json({ message: 'Payment is already refunded.' });
        }
        // Only receptionist or accountant of the same hospital or superadmin can refund
        if (
            req.user.role !== 'superadmin' &&
            req.user.role !== 'accountant' &&
            req.user.role !== 'receptionist'
        ) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        // Optionally, check hospitalId matches
        if (req.user.role !== 'superadmin' && payment.hospitalId.toString() !== req.user.hospitalId?.toString()) {
            return res.status(403).json({ message: 'Not authorized for this hospital.' });
        }
        payment.isRefunded = true;
        payment.refundAmount = refundAmount;
        payment.refundReason = refundReason || '';
        await payment.save();
        res.status(200).json({ message: 'Payment refunded successfully.', payment });
    } catch (err) {
        res.status(500).json({ message: 'Error refunding payment.', error: err.message });
    }
};

module.exports = { refundPayment };
