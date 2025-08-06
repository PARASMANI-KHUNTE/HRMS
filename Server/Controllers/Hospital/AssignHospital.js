const User = require('../../Models/User');
const Hospital = require('../../Models/Hospital');

// Superadmin assigns an admin to a hospital
const assignAdminToHospital = async (req, res) => {
    const { adminId, hospitalId } = req.body;
    if (!adminId || !hospitalId) {
        return res.status(400).json({ message: 'adminId and hospitalId are required.' });
    }
    try {
        const user = await User.findById(adminId);
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found.' });
        }
        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin.' });
        }
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }
        user.hospitalId = hospitalId;
        await user.save();
        res.status(200).json({ message: 'Admin assigned to hospital successfully.', user });
    } catch (err) {
        res.status(500).json({ message: 'Error assigning admin to hospital.', error: err.message });
    }
};

module.exports = { assignAdminToHospital };
