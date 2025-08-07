const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a single, reusable transporter object
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendMail = (to, subject, html) => {
    const mailOptions = {
        from: `HMSNOREPLY <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html, // Use html property for rich text
    };

    // sendMail returns a promise if no callback is provided
    return transporter.sendMail(mailOptions);
};

const sendMailWithAttachment = (to, subject, html, attachment) => {
    const mailOptions = {
        from: `HMSNOREPLY <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html, // Use html property for rich text
        attachments: attachment,
    };

    // sendMail returns a promise if no callback is provided
    return transporter.sendMail(mailOptions);
};

// Verify the transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! GMAIL TRANSPORTER ERROR - EMAIL WILL NOT WORK !!!');
        console.error('!!! Please check your EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in the Server/.env file.');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error(error);
    } else {
        console.log('✅ Gmail Transporter is configured correctly. Ready to send emails.');
    }
});

module.exports = {sendMail , sendMailWithAttachment};
