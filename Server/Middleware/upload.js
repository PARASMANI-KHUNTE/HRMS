const multer = require('multer');

// Configure multer to use memory storage and set a file size limit
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
        // Optional: Add logic to filter file types, e.g., only allow images
        // For now, we accept all files.
        cb(null, true);
    }
}).single('file'); // Expects a single file in a field named 'file'

// Middleware to handle multer errors gracefully
const handleUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g., file too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred
            return res.status(500).json({ message: 'An unknown error occurred during file upload.' });
        }
        // Everything went fine, proceed to the next middleware or route handler
        next();
    });
};

module.exports = handleUpload;
