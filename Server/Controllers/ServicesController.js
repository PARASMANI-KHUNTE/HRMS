const { sendMail } = require('../Services/Gmail');
const { sendSms } = require('../Services/Twilio');
const { uploadFile } = require('../Services/Cloudinary');

// Controller to send a test email
const sendTestEmail = async (req, res) => {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
        return res.status(400).json({ message: 'Missing required fields: to, subject, text' });
    }

    try {
        await sendMail(to, subject, text);
        res.status(200).json({ message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ message: 'Failed to send test email.', error: error.message });
    }
};

// Controller to send a test SMS
const sendTestSms = (req, res) => {
    const { to, body } = req.body;
    if (!to || !body) {
        return res.status(400).json({ message: 'Missing required fields: to, body' });
    }

    try {
        // Note: The Twilio service currently logs success/error to the console and doesn't return a promise.
        sendSms(to, body);
        res.status(200).json({ message: 'Test SMS sent successfully!' });
    } catch (error) {
        console.error('Error sending test SMS:', error);
        res.status(500).json({ message: 'Failed to send test SMS.', error: error.message });
    }
};

// Controller to upload a test file
const uploadTestFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const result = await uploadFile(req.file, { folder: 'hms_general_uploads' });

        res.status(200).json({
            message: 'Test file uploaded successfully!',
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Error uploading test file:', error);
        res.status(500).json({ message: 'Failed to upload test file.', error: error.message });
    }
};

module.exports = { sendTestEmail, sendTestSms, uploadTestFile };
