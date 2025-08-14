const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

categorySchema.index({ hospitalId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
