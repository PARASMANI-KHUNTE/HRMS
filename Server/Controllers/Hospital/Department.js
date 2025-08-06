const Department = require('../../Models/Department');

// Add department (global)
const addDepartment = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Department name is required.' });
    }
    try {
        const existing = await Department.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Department with this name already exists.' });
        }
        const department = new Department({ name });
        await department.save();
        res.status(201).json({ message: 'Department added successfully.', department });
    } catch (err) {
        res.status(500).json({ message: 'Error adding department.', error: err.message });
    }
};

// Update department
const updateDepartment = async (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ message: 'Department id and name are required.' });
    }
    try {
        const department = await Department.findByIdAndUpdate(id, { name, updatedAt: new Date() }, { new: true });
        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json({ message: 'Department updated successfully.', department });
    } catch (err) {
        res.status(500).json({ message: 'Error updating department.', error: err.message });
    }
};

// Delete department
const deleteDepartment = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Department id is required.' });
    }
    try {
        const department = await Department.findByIdAndDelete(id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json({ message: 'Department deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting department.', error: err.message });
    }
};

// Get all global departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching departments.', error: err.message });
    }
};

module.exports = { addDepartment, updateDepartment, deleteDepartment, getDepartments };
