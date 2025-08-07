const mongoose = require('mongoose');

const returnedItemSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    refundAmount: {
        type: Number,
        required: true,
    },
}, { _id: false });

const pharmacyReturnSchema = new mongoose.Schema({
    originalInvoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PharmacyInvoice',
        required: true,
    },
    returnedItems: [returnedItemSchema],
    totalRefundAmount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        trim: true,
        required: [true, 'A reason for the return is required.'],
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The pharmacist who processed the return
        required: true,
    },
}, { timestamps: true });

const PharmacyReturn = mongoose.model('PharmacyReturn', pharmacyReturnSchema);

module.exports = PharmacyReturn;
