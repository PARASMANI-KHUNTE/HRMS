require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSms = (to, body) => {
    client.messages
        .create({
            body: body,
            from: twilioPhoneNumber,
            to: to // Must be a valid, E.164 formatted phone number
        })
        .then(message => console.log('SMS sent successfully. SID:', message.sid))
        .catch(error => console.error('Error sending SMS:', error));
};

module.exports = { sendSms };
