const mongoose = require("mongoose");
const argon2 = require('argon2');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    phone: {
        type: String,
        unique: true,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password: String,
    resetOtp: String,
    resetOtpExpires: Date,
    role:{
        type: String,
        enum: ["superadmin"  , "admin" , "user" , "doctor" , "nurse" , "pharmacist" , "lab technician" , "accountant" , "receptionist"],
        default: "user"
    },
    createdAt: Date,
    updatedAt: { type: Date, default: Date.now },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        default: null
    },
    profilePictureUrl: String,
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    notificationPreferences: {
        email: {
            loginAlerts: { type: Boolean, default: true },
            passwordChanges: { type: Boolean, default: true },
            systemUpdates: { type: Boolean, default: true },
        },
        sms: {
            loginAlerts: { type: Boolean, default: false },
            passwordChanges: { type: Boolean, default: false },
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash the password
        this.password = await argon2.hash(this.password);
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model("User" , userSchema);

module.exports = User;
