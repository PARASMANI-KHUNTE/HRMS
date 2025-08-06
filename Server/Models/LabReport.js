const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labReportSchema = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    testName: { type: String, required: true },
    result: { type: String, required: true },
    referenceRange: { type: String },
    unit: { type: String },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reportDate: { type: Date, default: Date.now },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LabReport', labReportSchema);
