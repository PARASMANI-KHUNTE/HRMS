const Invoice = require('../../Models/Invoice');
const Patient = require('../../Models/Patient');

// Create invoice
const createInvoice = async (req, res) => {
    const { patientId, items, total } = req.body;
    if (!patientId || !items || !Array.isArray(items) || typeof total !== 'number') {
        return res.status(400).json({ message: 'patientId, items (array), and total (number) are required.' });
    }
    try {
        const invoice = new Invoice({
            patientId,
            hospitalId: req.user.hospitalId,
            createdBy: req.user._id,
            items,
            total
        });
        await invoice.save();
        res.status(201).json({ message: 'Invoice created successfully.', invoice });
    } catch (err) {
        res.status(500).json({ message: 'Error creating invoice.', error: err.message });
    }
};

// Update invoice
const updateInvoice = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        let query = { _id: id };
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        const invoice = await Invoice.findOneAndUpdate(query, updateData, { new: true })
            .populate('hospitalId', 'name')
            .populate('patientId', 'firstName lastName');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found or not authorized to update.' });
        }
        res.status(200).json({ message: 'Invoice updated successfully.', invoice });
    } catch (err) {
        res.status(500).json({ message: 'Error updating invoice.', error: err.message });
    }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        let query = { _id: id };
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        const invoice = await Invoice.findOneAndDelete(query);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found or not authorized to delete.' });
        }
        res.status(200).json({ message: 'Invoice deleted successfully.', invoiceId: id });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting invoice.', error: err.message });
    }
};

// Get invoice by id
const getInvoice = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        const invoice = await Invoice.findOne({ _id: id, hospitalId: req.user.hospitalId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        res.status(200).json(invoice);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching invoice.', error: err.message });
    }
};

// Get all invoices with search and pagination
const getAllInvoices = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        let query = {};
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            // Find patients that match the search query to filter invoices
            const patients = await Patient.find({
                $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
            }).select('_id');
            
            const patientIds = patients.map(p => p._id);
            
            // Add patient filter to the main query
            query.patientId = { $in: patientIds };
        }

        const invoices = await Invoice.find(query)
            .populate('hospitalId', 'name')
            .populate('patientId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Invoice.countDocuments(query);

        res.status(200).json({
            invoices,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalInvoices: count,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching invoices.', error: err.message });
    }
};

module.exports = { createInvoice, updateInvoice, deleteInvoice, getInvoice, getAllInvoices };
