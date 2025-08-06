const Payment = require('../../Models/Payment');
const Invoice = require('../../Models/Invoice');
const Patient = require('../../Models/Patient');

// Create payment
const createPayment = async (req, res) => {
    const { invoiceId, amount, method } = req.body;
    if (!invoiceId || typeof amount !== 'number' || !method) {
        return res.status(400).json({ message: 'invoiceId, amount, and method are required.' });
    }
    try {
        const payment = new Payment({
            invoiceId,
            hospitalId: req.user.hospitalId,
            createdBy: req.user._id,
            amount,
            method
        });
        await payment.save();
        res.status(201).json({ message: 'Payment created successfully.', payment });
    } catch (err) {
        res.status(500).json({ message: 'Error creating payment.', error: err.message });
    }
};

// View payment by id
const getPayment = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Payment id is required.' });
    }
    try {
        const payment = await Payment.findOne({ _id: id, hospitalId: req.user.hospitalId });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching payment.', error: err.message });
    }
};

// Get all payments with search and pagination
const getAllPayments = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        let query = {};
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        if (search) {
            const regex = new RegExp(search, 'i');

            // Find patients matching the search term
            const patients = await Patient.find({ 
                $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
            }).select('_id');
            const patientIds = patients.map(p => p._id);

            // Find invoices linked to those patients
            const invoices = await Invoice.find({ patientId: { $in: patientIds } }).select('_id');
            const invoiceIds = invoices.map(i => i._id);

            // Add invoice filter to the main query
            query.invoiceId = { $in: invoiceIds };
        }

        const payments = await Payment.find(query)
            .populate({
                path: 'invoiceId',
                select: 'patientId total',
                populate: {
                    path: 'patientId',
                    select: 'firstName lastName email'
                }
            })
            .populate('hospitalId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Payment.countDocuments(query);

        res.status(200).json({
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalPayments: count,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching payments.', error: err.message });
    }
};

module.exports = { createPayment, getPayment, getAllPayments };
