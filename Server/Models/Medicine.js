const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required.'],
        trim: true,
        unique: true, // Unique within a hospital, will be enforced by a compound index
    },
    description: {
        type: String,
        trim: true,
    },
    manufacturer: {
        type: String,
        trim: true,
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required.'],
        min: [0, 'Price cannot be negative.'],
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required.'],
        min: [0, 'Stock cannot be negative.'],
        default: 0,
    },
    expiryDate: {
        type: Date,
    },
    supplier: {
        type: String,
        trim: true,
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
