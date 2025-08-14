const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required.'],
        trim: true,
        unique: true, // Unique within a hospital, will be enforced by a compound index
    },
    generalDrug: {
        type: Boolean,
        default: false,
    },
    genericName: {
        type: String,
        trim: true,
    },
    manufacturer: {
        type: String,
        trim: true,
    },
    effects: {
        type: String,
        trim: true,
    },
    storeBox: {
        type: String,
        trim: true,
    },
    purchasePrice: {
        type: Number,
        min: [0, 'Price cannot be negative.'],
        default: 0,
    },
    salePrice: {
        type: Number,
        min: [0, 'Price cannot be negative.'],
        default: 0,
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required.'],
        min: [0, 'Price cannot be negative.'],
    },
    quantity: {
        type: Number,
        min: [0, 'Quantity cannot be negative.'],
        default: 0,
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required.'],
        min: [0, 'Stock cannot be negative.'],
        default: 0,
    },
    availableQuantity: {
        type: Number,
        min: [0, 'Available quantity cannot be negative.'],
        default: 0,
    },
    expiryDate: {
        type: Date,
    },
    category: {
        type: String,
        trim: true,
        default: 'General',
    },
    batchNumber: {
        type: String,
        trim: true,
    },
    free: {
        type: Number,
        min: [0, 'Free units cannot be negative.'],
        default: 0,
    },
    cgst: {
        type: Number,
        min: [0, 'CGST cannot be negative.'],
        max: [100, 'CGST cannot exceed 100%'],
        default: 0,
    },
    sgst: {
        type: Number,
        min: [0, 'SGST cannot be negative.'],
        max: [100, 'SGST cannot exceed 100%'],
        default: 0,
    },
    igst: {
        type: Number,
        min: [0, 'IGST cannot be negative.'],
        max: [100, 'IGST cannot exceed 100%'],
        default: 0,
    },
    hsnCode: {
        type: String,
        trim: true,
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital ID is required to scope the medicine.'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// Compound index to ensure medicine name is unique per hospital
medicineSchema.index({ name: 1, hospitalId: 1 }, { unique: true });

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
