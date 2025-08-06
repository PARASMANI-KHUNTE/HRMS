// This is a temporary script to test the Gmail (Nodemailer) service.

const { sendMail } = require('./Services/Gmail');

// *******************************************************************
// IMPORTANT: Replace 'RECIPIENT_EMAIL_HERE' with a valid email address
// you can check for incoming mail.
// *******************************************************************
const testRecipientEmail = 'parasmanikhunte@gmail.com';
const testSubject = 'Test Email from HMS App';
const testBody = '<h1>Welcome!</h1><p>If you are seeing this email, it means the Nodemailer service is configured correctly and working!</p>';

if (testRecipientEmail === 'RECIPIENT_EMAIL_HERE') {
    console.error('--------------------------------------------------------------------');
    console.error('Please open test-email.js and replace RECIPIENT_EMAIL_HERE');
    console.error('with a valid recipient email address before running this script.');
    console.error('--------------------------------------------------------------------');
} else {
    console.log(`Sending a test email to ${testRecipientEmail}...`);
    sendMail(testRecipientEmail, testSubject, testBody)
        .then(info => {
            console.log('Test email sent successfully!');
            console.log('Message ID:', info.messageId);
            console.log('Preview URL:', info.preview ? info.preview : 'No preview URL available.');
        })
        .catch(error => {
            console.error('Failed to send test email:');
            console.error(error);
        });
}
