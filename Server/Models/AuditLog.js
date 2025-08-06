const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditLogSchema = new Schema({
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // null for unauthenticated actions
    action: { type: String, required: true },
    target: { type: String }, // e.g. 'User', 'Patient', 'Invoice', etc.
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Object }, // additional info (before/after, payload, etc.)
    ip: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
