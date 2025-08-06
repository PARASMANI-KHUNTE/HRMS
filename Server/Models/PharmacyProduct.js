const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pharmacyProductSchema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PharmacyProduct', pharmacyProductSchema);
