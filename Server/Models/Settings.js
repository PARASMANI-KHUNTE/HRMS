const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Using a single document to store all settings
  singleton: {
    type: String,
    default: 'main',
    unique: true
  },
  siteName: {
    type: String,
    trim: true,
    default: 'Akkura HMS'
  },
  siteLogo: {
    type: String,
    default: '' // URL to the logo
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowPublicRegistration: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure there is only one settings document in the collection
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ singleton: 'main' });
  if (!settings) {
    settings = await this.create({ singleton: 'main' });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
