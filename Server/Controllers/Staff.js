const User = require('../Models/User');
const argon2 = require('argon2');
const { logAction } = require('../Utils/auditLogger');
const { sendMail } = require('../Services/Gmail');

// Get staff by hospital with pagination and search
const getStaffByHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { page = 1, limit = 10, search = '' } = req.query;

        if (!hospitalId) {
            return res.status(400).json({ message: 'Hospital ID is required.' });
        }

        // Build search query
        const searchQuery = search 
            ? {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { role: { $regex: search, $options: 'i' } },
                ],
            }
            : {};

        // Combine with hospital filter
        const query = { ...searchQuery, hospitalId };

        const staff = await User.find(query)
            .populate('departmentId')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);

        res.status(200).json({
            staff,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff data.', error: error.message });
    }
};

const addStaff = async (req, res) => {
    const { firstName, lastName, phone, email, password, role, hospitalId, departmentId } = req.body;

    if (!firstName || !lastName || !phone || !email || !password || !role || !hospitalId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email or phone number already exists.' });
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            role,
            hospitalId,
            departmentId: departmentId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newUser.save();

        await logAction({
            actor: req.user.id,
            action: 'ADD_STAFF',
            target: 'User',
            targetId: newUser._id,
            details: { email: newUser.email, role: newUser.role, hospitalId: newUser.hospitalId }
        }, req);

        // Send welcome email
        try {
            await sendMail(
                email,
                'Welcome to the Team!',
                `<h2>Hi ${firstName},</h2><p>An account has been created for you at HMS. You can now log in with your email and the password provided.</p>`
            );
        } catch (mailErr) {
            console.error("Staff welcome email failed to send:", mailErr);
        }
        
        const populatedStaff = await User.findById(newUser._id).populate('hospitalId').populate('departmentId');

        res.status(201).json({ message: 'Staff member added successfully.', staff: populatedStaff });

    } catch (err) {
        res.status(500).json({ message: 'Server error while adding staff.', error: err.message });
    }
};

const editStaff = async (req, res) => {
    const { id, ...updateData } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Staff ID is required for an update.' });
    }

    // If a new password is provided, it will be hashed by the pre-save hook.
    // If the password field is empty or not present, it will be ignored.
    if (updateData.password === '' || updateData.password === null) {
        delete updateData.password;
    }

    try {
        const updatedStaff = await User.findByIdAndUpdate(id, 
            { ...updateData, updatedAt: new Date() }, 
            { new: true, runValidators: true }
        ).populate('hospitalId').populate('departmentId');

        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        await logAction({
            actor: req.user.id,
            action: 'EDIT_STAFF',
            target: 'User',
            targetId: updatedStaff._id,
            details: { changes: Object.keys(updateData) }
        }, req);

        res.status(200).json({ message: 'Staff member updated successfully.', staff: updatedStaff });

    } catch (err) {
        res.status(500).json({ message: 'Server error while updating staff.', error: err.message });
    }
};

const deleteStaff = async (req, res) => {
    const { id } = req.params;

    try {
        const staffToDelete = await User.findById(id);
        if (!staffToDelete) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        // Prevent deletion of superadmin
        if (staffToDelete.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete a superadmin account.' });
        }

        await User.findByIdAndDelete(id);

        await logAction({
            actor: req.user.id,
            action: 'DELETE_STAFF',
            target: 'User',
            targetId: id,
            details: { email: staffToDelete.email, role: staffToDelete.role }
        }, req);

        res.status(200).json({ message: 'Staff member deleted successfully.' });

    } catch (err) {
        res.status(500).json({ message: 'Server error while deleting staff.', error: err.message });
    }
};

const getStaffForAdmin = async (req, res) => {
    try {
        // The admin's user object is attached to the request by the auth middleware.
        const adminUserId = req.user.id;

        // Find the admin to get their hospital ID.
        const admin = await User.findById(adminUserId);
        if (!admin || !admin.hospitalId) {
            return res.status(404).json({ message: 'Admin not found or not assigned to a hospital.' });
        }

        // Find all users (staff) that belong to the same hospital.
        // Exclude superadmins and the admin themselves from the list.
        const staff = await User.find({
            hospitalId: admin.hospitalId,
            _id: { $ne: adminUserId }, // Exclude the admin making the request
            role: { $nin: ['superadmin'] } // Exclude superadmins
        })
        .populate('hospitalId')
        .populate('departmentId')
        .select('-password');

        res.status(200).json(staff);

    } catch (err) {
        console.error("Error fetching staff for admin:", err);
        res.status(500).json({ message: 'Server error while fetching staff.', error: err.message });
    }
};

module.exports = { getStaffByHospital, addStaff, editStaff, deleteStaff, getStaffForAdmin };
