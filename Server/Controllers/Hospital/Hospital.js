const Hospital = require('../../Models/Hospital');

// Create Hospital
const createHospital = async (req, res) => {
    const { name, address, phone, email } = req.body;
    if (!name || !address || !phone) {
        return res.status(400).json({ message: 'Name, address, and phone are required.' });
    }
    try {
        const existing = await Hospital.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Hospital already exists.' });
        }
        const hospital = new Hospital({ name, address, phone, email });
        await hospital.save();
        res.status(201).json({ message: 'Hospital created successfully.', hospital });
    } catch (err) {
        res.status(500).json({ message: 'Error creating hospital.', error: err.message });
    }
};

// Update Hospital
const updateHospital = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Hospital id is required.' });
    }
    try {
        updateData.updatedAt = new Date();
        const hospital = await Hospital.findByIdAndUpdate(id, updateData, { new: true });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }
        res.status(200).json({ message: 'Hospital updated successfully.', hospital });
    } catch (err) {
        res.status(500).json({ message: 'Error updating hospital.', error: err.message });
    }
};

// Delete Hospital
const deleteHospital = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Hospital id is required.' });
    }
    try {
        const hospital = await Hospital.findByIdAndDelete(id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }
        res.status(200).json({ message: 'Hospital deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting hospital.', error: err.message });
    }
};

// Get all hospitals
const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().populate('departments');
        res.status(200).json(hospitals);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching hospitals.', error: err.message });
    }
};

// Get hospital by id
const getHospital = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Hospital id is required.' });
    }
    try {
        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }
        res.status(200).json(hospital);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching hospital.', error: err.message });
    }
};

// Assign departments to a hospital
const assignDepartmentsToHospital = async (req, res) => {
    const { hospitalId, departmentIds } = req.body;

    if (!hospitalId || !Array.isArray(departmentIds)) {
        return res.status(400).json({ message: 'Hospital ID and an array of department IDs are required.' });
    }

    try {
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }

        hospital.departments = departmentIds;
        await hospital.save();

        res.status(200).json({ message: 'Departments assigned successfully.', hospital });
    } catch (err) {
        res.status(500).json({ message: 'Error assigning departments.', error: err.message });
    }
};

module.exports = {
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitals,
    getHospital,
    assignDepartmentsToHospital
};
