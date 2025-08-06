const User = require('../../Models/User');
const Department = require('../../Models/Department');

// Assign department to staff (by admin of hospital or superadmin)
const assignDepartment = async (req, res) => {
    const { staffId, departmentId } = req.body;
    if (!staffId || !departmentId) {
        return res.status(400).json({ message: 'staffId and departmentId are required.' });
    }
    try {
        const staff = await User.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: 'Staff user not found.' });
        }
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        // Only allow assignment if staff and department are in same hospital (unless superadmin)
        if (req.user.role !== 'superadmin' && (!req.user.hospitalId || staff.hospitalId?.toString() !== req.user.hospitalId?.toString() || department.hospitalId?.toString() !== req.user.hospitalId?.toString())) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        // Optional: Only allow certain roles to be assigned to certain departments
        // Example: pharmacy department only to pharmacist
        if (department.name.toLowerCase().includes('pharma') && staff.role !== 'pharmacist') {
            return res.status(400).json({ message: 'Only pharmacist can be assigned to pharmacy department.' });
        }
        staff.departmentId = departmentId;
        await staff.save();
        res.status(200).json({ message: 'Department assigned to staff successfully.', staff });
    } catch (err) {
        res.status(500).json({ message: 'Error assigning department.', error: err.message });
    }
};

module.exports = { assignDepartment };
