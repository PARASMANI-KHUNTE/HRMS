const PharmacyInvoice = require('../../Models/PharmacyInvoice');
const PharmacyProduct = require('../../Models/PharmacyProduct');

// Create pharmacy invoice
const createPharmacyInvoice = async (req, res) => {
    const { products, total, patientId } = req.body;
    if (!products || !Array.isArray(products) || typeof total !== 'number') {
        return res.status(400).json({ message: 'products (array) and total (number) are required.' });
    }
    try {
        // Check product stock
        for (const item of products) {
            const prod = await PharmacyProduct.findById(item.productId);
            if (!prod || prod.hospitalId.toString() !== req.user.hospitalId?.toString()) {
                return res.status(400).json({ message: `Product not found: ${item.productId}` });
            }
            if (prod.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for: ${prod.name}` });
            }
        }
        // Decrement stock
        for (const item of products) {
            await PharmacyProduct.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } });
        }
        const invoice = new PharmacyInvoice({
            products,
            total,
            patientId,
            hospitalId: req.user.hospitalId,
            createdBy: req.user._id,
            status: 'unpaid'
        });
        await invoice.save();
        res.status(201).json({ message: 'Pharmacy invoice created successfully.', invoice });
    } catch (err) {
        res.status(500).json({ message: 'Error creating pharmacy invoice.', error: err.message });
    }
};

// Update pharmacy invoice
const updatePharmacyInvoice = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        updateData.updatedAt = new Date();
        const invoice = await PharmacyInvoice.findOneAndUpdate({ _id: id, hospitalId: req.user.hospitalId }, updateData, { new: true });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        res.status(200).json({ message: 'Pharmacy invoice updated successfully.', invoice });
    } catch (err) {
        res.status(500).json({ message: 'Error updating pharmacy invoice.', error: err.message });
    }
};

// Delete pharmacy invoice
const deletePharmacyInvoice = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        const invoice = await PharmacyInvoice.findOneAndDelete({ _id: id, hospitalId: req.user.hospitalId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        res.status(200).json({ message: 'Pharmacy invoice deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting pharmacy invoice.', error: err.message });
    }
};

// Get pharmacy invoice by id
const getPharmacyInvoice = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        const invoice = await PharmacyInvoice.findOne({ _id: id, hospitalId: req.user.hospitalId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        res.status(200).json(invoice);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pharmacy invoice.', error: err.message });
    }
};

// Get all pharmacy invoices for hospital
const getAllPharmacyInvoices = async (req, res) => {
    try {
        const invoices = await PharmacyInvoice.find({ hospitalId: req.user.hospitalId });
        res.status(200).json(invoices);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pharmacy invoices.', error: err.message });
    }
};

// Return/refund pharmacy invoice (restock products)
const returnPharmacyInvoice = async (req, res) => {
    const { id, reason } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        const invoice = await PharmacyInvoice.findById(id);
        if (!invoice || invoice.hospitalId.toString() !== req.user.hospitalId?.toString()) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        if (invoice.status === 'returned') {
            return res.status(400).json({ message: 'Invoice already returned.' });
        }
        // Restock products
        for (const item of invoice.products) {
            await PharmacyProduct.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
        }
        invoice.status = 'returned';
        invoice.updatedAt = new Date();
        await invoice.save();
        res.status(200).json({ message: 'Pharmacy invoice returned and products restocked.', invoice });
    } catch (err) {
        res.status(500).json({ message: 'Error returning pharmacy invoice.', error: err.message });
    }
};

module.exports = {
    createPharmacyInvoice,
    updatePharmacyInvoice,
    deletePharmacyInvoice,
    getPharmacyInvoice,
    getAllPharmacyInvoices,
    returnPharmacyInvoice
};
