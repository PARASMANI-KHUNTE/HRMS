const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pharmacyInvoiceSchema = new Schema({
    products: [{
        productId: { type: Schema.Types.ObjectId, ref: 'PharmacyProduct', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'cancelled', 'returned'], default: 'unpaid' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PharmacyInvoice', pharmacyInvoiceSchema);
