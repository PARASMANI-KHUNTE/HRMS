const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseItemSchema = new Schema({
  medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
}, { _id: false });

const purchaseSchema = new Schema({
  supplierName: { type: String },
  billNumber: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  items: { type: [purchaseItemSchema], required: true },
  subtotal: { type: Number, required: true },
  totalTax: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
