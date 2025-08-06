const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); // Install this: npm install mime-types
const { uploadFile, deleteFile } = require('./Services/Cloudinary');

// Path to the test file
const filePath = path.join(__dirname, 'testImage.jpg');

// Read the file and create a mock 'file' object like Multer would provide
const createMockFile = (filePath) => {
    const buffer = fs.readFileSync(filePath);
    const mimetype = mime.lookup(filePath); // e.g., 'text/plain' for .txt files

    if (!mimetype) throw new Error('Unknown file type');

    return {
        buffer,
        mimetype,
    };
};

const runTest = async () => {
    try {
        console.log('--- Testing Cloudinary File Upload ---');

        const mockFile = createMockFile(filePath);

        const uploadResult = await uploadFile(mockFile, { folder: 'hms_tests' });

        if (!uploadResult || !uploadResult.public_id) {
            throw new Error('Upload failed or did not return a public_id.');
        }

        console.log(`\n✅ File uploaded. Public ID: ${uploadResult.public_id}`);
        console.log(`🔗 Secure URL: ${uploadResult.secure_url}`);

        //Delete the file
        console.log('\n--- Testing Cloudinary File Deletion ---');
        const deleteResult = await deleteFile(uploadResult.public_id);

        if (deleteResult.result !== 'ok') {
            console.error('❌ Deletion may have failed. Result:', deleteResult.result);
        } else {
            console.log('✅ File successfully deleted from Cloudinary.');
        }

        console.log('\n✅ Cloudinary service test completed successfully!');

    } catch (error) {
        console.error('\n❌ Cloudinary Test Failed');
        console.error('Error:', error.message);
    }
};

runTest();
