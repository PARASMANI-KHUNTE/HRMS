const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    address: { type: String },
    admitted: { type: Boolean, default: false },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
