// This is a temporary script to test the Twilio SMS service.

const { sendSms } = require('./Services/Twilio');

// *******************************************************************
// IMPORTANT: Replace 'YOUR_PHONE_NUMBER_HERE' with your phone number.
// It must be in E.164 format (e.g., '+919876543210' or '+14155552671').
// *******************************************************************
const testPhoneNumber = '+918103713757';
const testMessage = 'Hello from your HMS App! Twilio SMS is working.';

if (testPhoneNumber === 'YOUR_PHONE_NUMBER_HERE') {
    console.error('--------------------------------------------------------------------');
    console.error('Please open test-sms.js and replace YOUR_PHONE_NUMBER_HERE');
    console.error('with your actual phone number before running this script.');
    console.error('--------------------------------------------------------------------');
} else {
    console.log(`Sending a test SMS to ${testPhoneNumber}...`);
    sendSms(testPhoneNumber, testMessage);
}
