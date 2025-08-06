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

module.exports = {sendMail , sendMailWithAttachment};
