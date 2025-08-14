const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

// Schema for individual items sold in an invoice
const soldItemSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
    },
    name: { // Denormalized for historical accuracy
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: { // Denormalized for historical accuracy
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
}, { _id: false });

// Main schema for the pharmacy invoice
const pharmacyInvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    items: [soldItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Credit', 'Credit Card', 'Insurance', 'Other'],
        default: 'Cash',
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Cancelled', 'Partially Returned', 'Returned'],
        default: 'Paid',
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
    pharmacistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The user who created the invoice
        required: true,
    },
}, { timestamps: true });

// Pre-save hook to generate a unique invoice number
pharmacyInvoiceSchema.pre('validate', async function (next) {
    if (this.isNew) {
        // Generate a unique, human-readable invoice number like 'INV-A1B2C3D4'
        const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
        this.invoiceNumber = `INV-${await nanoid()}`;
    }
    next();
});

const PharmacyInvoice = mongoose.model('PharmacyInvoice', pharmacyInvoiceSchema);

module.exports = PharmacyInvoice;

