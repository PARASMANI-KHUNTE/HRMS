const User = require("../../Models/User");
const argon2 = require('argon2');
const { createToken } = require('../../Middleware/middleware');
const { uploadFile } = require("../../Services/Cloudinary");
const { logAction } = require('../../Utils/auditLogger');
const { sendMail } = require("../../Services/Gmail");
const { sendSms } = require("../../Services/Twilio");
const { generateOtp } = require('../../Utils/otpGenerator');



const LoginUser = async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            await logAction({ 
                actor: user._id, 
                action: 'USER_LOGIN_FAILURE', 
                target: 'User',
                targetId: user._id,
                details: { reason: 'Invalid credentials' } 
            }, req);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = createToken({
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture
});

        await logAction({ 
            actor: user._id, 
            action: 'USER_LOGIN_SUCCESS',
            target: 'User',
            targetId: user._id 
        }, req);

        res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, profilePicture: user.profilePicture } });

    } catch (err) {
        res.status(500).json({ message: 'Server error during login.', error: err.message });
    }
}




const ToggleRole = async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent non-superadmins from promoting a user to superadmin
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "You are not authorized to assign the superadmin role." });
    }

    try {
        const updatedUser = await User.findOneAndUpdate({ email }, { role, updatedAt: new Date() }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User role updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during role update.', error: err.message });
    }
}

const GetAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('hospitalId').populate('departmentId').select('-password'); // Exclude passwords from the result
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching users.', error: err.message });
    }
}

const GetUser = async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email }).select('-password'); // Exclude password from the result
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching user.', error: err.message });
    }
}

const updateUserProfilePicture = async (req, res) => {
    try {
        // 1. Check if a file was uploaded by the middleware
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // The user's ID should be available from the token verification middleware
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found in token.' });
        }

        // 2. Upload the file from req.file to Cloudinary
        const result = await uploadFile(req.file, { folder: 'hms_profile_pictures' });

        // 3. Save the secure URL to the user's record in the database
        // 3. Save the secure URL and retrieve the updated user document
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePicture: result.secure_url, updatedAt: new Date() }, // Corrected field name
            { new: true } // This option returns the modified document
        );

        // 4. Log the action
        await logAction({
            actor: userId,
            action: 'UPDATE_PROFILE_PICTURE',
            target: 'User',
            targetId: userId
        }, req);

        // 5. Send the updated user object back to the client
        res.status(200).json({ 
            message: 'Profile picture updated successfully!',
            user: updatedUser // Return the full user object
        });

    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: 'Error updating profile picture.', error: error.message });
    }
};

// --- Password Reset with OTP Controllers ---
// (All necessary imports are already at the top of this file)

// 1. Request Password Reset (generate and send OTP)
const requestPasswordReset = async (req, res) => {
    console.log('--- Password Reset Request Received ---');
    const { email, phone } = req.body;
    console.log(`1. Email: ${email}, Phone: ${phone}`);

    if (!email && !phone) {
        console.log('❌ Error: Email or phone is required.');
        return res.status(400).json({ message: "Email or phone is required." });
    }

    try {
        const user = await User.findOne(email ? { email } : { phone });
        if (!user) {
            console.log('❌ Error: User not found.');
            return res.status(404).json({ message: "User not found." });
        }
        console.log(`2. User found: ${user.email}`);

        const otp = generateOtp();
        console.log(`3. Generated OTP: ${otp}`);

        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.resetOtp = otp;
        user.resetOtpExpires = expiry;
        await user.save();
        console.log('4. OTP and expiry saved to user document in DB.');

        // Send OTP via email
        if (user.email) {
            console.log('5a. Attempting to send email...');
            try {
                await sendMail(
                    user.email,
                    'Your Password Reset OTP',
                    `<h2>Your OTP for password reset is: <b>${otp}</b></h2><p>This OTP will expire in 10 minutes.</p>`
                );
                console.log('✅ Email sent successfully.');
            } catch (mailError) {
                console.error('❌ CRITICAL: Failed to send OTP email:', mailError);
                return res.status(500).json({ message: 'Failed to send OTP email. Please check server configuration.', error: mailError.message });
            }
        }

        // Send OTP via SMS
        if (user.phone) {
            console.log('5b. Attempting to send SMS...');
            try {
                await sendSms(user.phone, `Your HMS password reset OTP is: ${otp}`);
                console.log('✅ SMS sent successfully.');
            } catch (smsError) {
                console.error('⚠️ WARNING: Failed to send OTP SMS:', smsError);
                // Do not return, as email might have succeeded. Log and continue.
            }
        }

        console.log('6. Responding to client with success.');
        res.status(200).json({ message: 'OTP sent successfully. Please check your email and/or phone.' });
        console.log('--- Password Reset Request Finished Successfully ---\n');

    } catch (err) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! PASSWORD RESET CONTROLLER CRITICAL ERROR !!!');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error(err);
        res.status(500).json({ message: 'Error processing password reset request.', error: err.message });
    }
};

// 2. Verify OTP
const verifyOtp = async (req, res) => {
    const { email, phone, otp } = req.body;
    if ((!email && !phone) || !otp) {
        return res.status(400).json({ message: "Email or phone and OTP are required." });
    }
    try {
        const user = await User.findOne(email ? { email } : { phone });
        if (!user || !user.resetOtp || !user.resetOtpExpires) {
            return res.status(400).json({ message: "No OTP request found. Please request a new OTP." });
        }
        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }
        if (user.resetOtpExpires < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
        }
        res.status(200).json({ message: "OTP verified. You may now reset your password." });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying OTP.', error: err.message });
    }
};

// 3. Reset Password
const resetPassword = async (req, res) => {
    const { email, phone, otp, newPassword } = req.body;
    if ((!email && !phone) || !otp || !newPassword) {
        return res.status(400).json({ message: "Email or phone, OTP, and new password are required." });
    }
    try {
        const user = await User.findOne(email ? { email } : { phone });
        if (!user || !user.resetOtp || !user.resetOtpExpires) {
            return res.status(400).json({ message: "No OTP request found. Please request a new OTP." });
        }
        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }
        if (user.resetOtpExpires < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
        }
        user.password = newPassword; // Will be hashed by pre-save hook
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password.', error: err.message });
    }
};

const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await argon2.verify(user.password, currentPassword);
        if (!isMatch) {
            await logAction({
                actor: userId,
                action: 'CHANGE_PASSWORD_FAILURE',
                target: 'User',
                targetId: userId,
                details: { reason: 'Incorrect current password' }
            }, req);
            return res.status(401).json({ message: "Incorrect current password." });
        }

        user.password = newPassword; // Hashing is handled by the pre-save hook
        await user.save();

        await logAction({
            actor: userId,
            action: 'CHANGE_PASSWORD_SUCCESS',
            target: 'User',
            targetId: userId
        }, req);

        res.status(200).json({ message: "Password changed successfully." });

    } catch (err) {
        res.status(500).json({ message: 'Server error during password change.', error: err.message });
    }
};

const updateNotificationPreferences = async (req, res) => {
    const { userId } = req.params;
    const { preferences } = req.body;

    // Ensure the user is updating their own preferences or is a superadmin
    if (req.user.id !== userId && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: You can only update your own preferences.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Merge the new preferences with the existing ones
        user.notificationPreferences = {
            ...user.notificationPreferences,
            ...preferences,
        };

        await user.save();

        await logAction({
            actor: req.user.id,
            action: 'UPDATE_NOTIFICATION_PREFERENCES',
            target: 'User',
            targetId: userId,
            details: { preferences }
        }, req);

        res.status(200).json({ 
            message: 'Notification preferences updated successfully.', 
            preferences: user.notificationPreferences 
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error updating preferences.', error: err.message });
    }
};

module.exports = { LoginUser , ToggleRole , GetAllUsers , GetUser, updateUserProfilePicture, requestPasswordReset, verifyOtp, resetPassword, changePassword, updateNotificationPreferences};
