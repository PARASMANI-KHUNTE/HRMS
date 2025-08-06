require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary.
 * @param {string} filePath - The local path to the file to upload.
 * @param {object} options - Cloudinary upload options (e.g., { folder: 'avatars' }).
 * @returns {Promise<object>} - The upload result from Cloudinary.
 */
const uploadFile = async (file, options = {}) => {
    try {
        // Add automatic optimization to the options
        const uploadOptions = {
            ...options,
            quality: 'auto',
            fetch_format: 'auto'
        };
        // Convert buffer to Data URI
        const b64 = Buffer.from(file.buffer).toString('base64');
        let dataURI = 'data:' + file.mimetype + ';base64,' + b64;

        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
        console.log('File uploaded successfully to Cloudinary:', result.secure_url);
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the file to delete.
 * @returns {Promise<object>} - The deletion result from Cloudinary.
 */
const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('File deleted successfully from Cloudinary:', result);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

/**
 * Updates an existing file in Cloudinary by overwriting it.
 * @param {string} publicId - The public ID of the file to update.
 * @param {string} filePath - The local path to the new file.
 * @returns {Promise<object>} - The upload result from Cloudinary.
 */
const updateFile = async (publicId, file) => {
    try {
        // Upload the new file, overwriting the one with the same public_id
        // Upload the new file with optimization, overwriting the one with the same public_id
        // Convert buffer to Data URI
        const b64 = Buffer.from(file.buffer).toString('base64');
        let dataURI = 'data:' + file.mimetype + ';base64,' + b64;

        const result = await cloudinary.uploader.upload(dataURI, { 
            public_id: publicId, 
            overwrite: true, 
            quality: 'auto',
            fetch_format: 'auto'
        });
        console.log('File updated successfully in Cloudinary:', result.secure_url);
        return result;
    } catch (error) {
        console.error('Error updating file in Cloudinary:', error);
        throw error;
    }
};

module.exports = { uploadFile, deleteFile, updateFile };
