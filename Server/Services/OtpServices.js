

const { sendMail } = require("./Gmail");

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
    
}
const verifyOtp = (otp , userOtp) => {
    return otp === userOtp;
}

const sendOtp = (to , subject) => {
    const otp = generateOtp();
    sendMail(to , subject , `Your OTP is ${otp}`);
}


module.exports = {generateOtp , verifyOtp , sendOtp };