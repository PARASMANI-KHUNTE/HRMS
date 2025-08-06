const Settings = require('../models/Settings');
const cloudinary = require('../services/Cloudinary');
const fs = require('fs');

// @desc    Get application settings
// @route   GET /api/settings
// @access  Public (or Private to logged-in users)
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching settings.', error: error.message });
  }
};

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private/Superadmin
exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    const { siteName, maintenanceMode, allowPublicRegistration } = req.body;

    settings.siteName = siteName ?? settings.siteName;
    settings.maintenanceMode = maintenanceMode ?? settings.maintenanceMode;
    settings.allowPublicRegistration = allowPublicRegistration ?? settings.allowPublicRegistration;

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'hms_logos',
          public_id: `logo_${Date.now()}`,
          quality: 'auto',
          fetch_format: 'auto',
        });
        settings.siteLogo = result.secure_url;
        // Clean up the uploaded file from the server
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Even if upload fails, don't block other settings changes
        console.error('Cloudinary upload failed:', uploadError);
        // Clean up file anyway
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: 'Image upload failed. Please try again.' });
      }
    }

    const updatedSettings = await settings.save();
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating settings.', error: error.message });
  }
};
