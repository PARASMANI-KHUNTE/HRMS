const express = require("express");
const router = express.Router();
const {CreateUser , LoginUser , DeleteUser , UpdateUser , ToggleRole , GetAllUsers , GetUser, updateUserProfilePicture, requestPasswordReset, verifyOtp, resetPassword, updateNotificationPreferences} = require('../../Controllers/Auth/User');
const handleUpload = require('../../Middleware/upload');
const { verifyToken, verifyTokenAndRole } = require("../../Middleware/middleware");


//
router.post("/register",(req , res) => {
    CreateUser(req , res);
})

router.post("/login" , (req , res) => {
    LoginUser(req , res);
})

router.delete("/delete" , verifyTokenAndRole(['admin','superadmin']), (req , res) => {
    DeleteUser(req , res);
})

router.put("/update" , verifyTokenAndRole(['admin', 'superadmin']), (req , res) => {
    UpdateUser(req , res);
})

router.get("/getallusers" ,verifyTokenAndRole(['superadmin' , 'admin']), GetAllUsers);

// Route to update user profile picture
router.post("/user/profile-picture", verifyToken, handleUpload, updateUserProfilePicture);

router.get("/get" , verifyTokenAndRole(['admin', 'superadmin']), (req , res) => {
    GetAllUsers(req , res);
})

router.get("/get/:email" , verifyTokenAndRole(['admin', 'superadmin']), (req , res) => {
    GetUser(req , res);
})

router.put("/toggle" , verifyTokenAndRole(['admin','superadmin']), (req , res) => {
    ToggleRole(req , res);
})

// Password reset with OTP endpoints
router.post('/forgot-password', (req, res) => {
    requestPasswordReset(req, res);
});

router.post('/verify-otp', (req, res) => {
    require('../../Controllers/Auth/User').verifyOtp(req, res);
});

router.post('/reset-password', (req, res) => {
    require('../../Controllers/Auth/User').resetPassword(req, res);
});

// Change password when user is logged in
router.post('/change-password', verifyToken, (req, res) => {
    require('../../Controllers/Auth/User').changePassword(req, res);
});

// Update notification preferences
router.put('/preferences/:userId', verifyToken, (req, res) => {
    updateNotificationPreferences(req, res);
});

module.exports = router;
