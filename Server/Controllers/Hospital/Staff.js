const User = require('../../Models/User');

// Admin adds a staff member to their hospital
const addStaff = async (req, res) => {
    const { firstName, lastName, phone, email, password, role, hospitalId, departmentId } = req.body;
    if (!firstName || !lastName || !phone || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!['doctor','nurse','pharmacist','lab technician','accountant','receptionist'].includes(role)) {
        return res.status(400).json({ message: 'Invalid staff role.' });
    }

    try {
        let finalHospitalId = hospitalId;

        // If the user is an admin, they can only add to their own hospital
        if (req.user.role === 'admin') {
            if (!req.user.hospitalId) {
                return res.status(400).json({ message: 'Admin is not assigned to a hospital.' });
            }
            finalHospitalId = req.user.hospitalId;
        } else if (req.user.role === 'superadmin') {
            // If superadmin, hospitalId must be provided in the body
            if (!hospitalId) {
                return res.status(400).json({ message: 'Hospital ID is required for superadmin.' });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const newStaff = new User({
            firstName,
            lastName,
            phone,
            email,
            password,
            role,
            hospitalId: finalHospitalId,
            departmentId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newStaff.save();
        const populatedStaff = await User.findById(newStaff._id).populate('hospitalId', 'name').populate('departmentId', 'name');
        res.status(201).json({ message: 'Staff member added successfully.', staff: populatedStaff });
    } catch (err) {
        res.status(500).json({ message: 'Error adding staff member.', error: err.message });
    }
};

// Admin gets all staff for their hospital
const getStaff = async (req, res) => {
    try {
        const hospitalId = req.user.hospitalId;
        if (!hospitalId) {
            return res.status(400).json({ message: 'Admin is not assigned to a hospital.' });
        }
        const staff = await User.find({ hospitalId, role: { $nin: ['admin', 'superadmin', 'user'] } }).select('-password');
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching staff.', error: err.message });
    }
};

// Edit staff member
const editStaff = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Staff user id is required.' });
    }
    try {
        const staff = await User.findById(id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff user not found.' });
        }
        // Only admin of the hospital or superadmin can edit
        if (req.user.role !== 'superadmin' && (!req.user.hospitalId || staff.hospitalId?.toString() !== req.user.hospitalId?.toString())) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        // Prevent role changes to admin/superadmin
        if (updateData.role && ['admin','superadmin'].includes(updateData.role)) {
            return res.status(400).json({ message: 'Cannot assign admin/superadmin role to staff.' });
        }
        updateData.updatedAt = new Date();
        Object.assign(staff, updateData);
        await staff.save();
        res.status(200).json({ message: 'Staff member updated successfully.', staff });
    } catch (err) {
        res.status(500).json({ message: 'Error updating staff member.', error: err.message });
    }
};

// Delete staff member
const deleteStaff = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Staff user id is required.' });
    }
    try {
        const staff = await User.findById(id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff user not found.' });
        }
        // Only admin of the hospital or superadmin can delete
        if (req.user.role !== 'superadmin' && (!req.user.hospitalId || staff.hospitalId?.toString() !== req.user.hospitalId?.toString())) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        await staff.deleteOne();
        res.status(200).json({ message: 'Staff member deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting staff member.', error: err.message });
    }
};

// Superadmin gets all staff from all hospitals
const getAllStaffSuperadmin = async (req, res) => {
    try {
        const staff = await User.find({ 
            role: { $nin: ['admin', 'superadmin', 'user'] } 
        })
        .populate('hospitalId', 'name') // Populate hospital name
        .select('-password');
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching staff.', error: err.message });
    }
};

module.exports = { addStaff, getStaff, editStaff, deleteStaff, getAllStaffSuperadmin };
