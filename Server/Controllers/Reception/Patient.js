const Patient = require('../../Models/Patient');

// Create patient
const createPatient = async (req, res) => {
    const { firstName, lastName, phone, email, gender, dob, address, hospitalId } = req.body;
    if (!firstName || !lastName || !phone) {
        return res.status(400).json({ message: 'First name, last name, and phone are required.' });
    }

    let finalHospitalId = hospitalId;
    if (req.user.role !== 'superadmin') {
        finalHospitalId = req.user.hospitalId;
    } else if (!hospitalId) {
        return res.status(400).json({ message: 'Hospital ID is required for superadmin.' });
    }

    try {
        const patient = new Patient({
            firstName,
            lastName,
            phone,
            email,
            gender,
            dob,
            address,
            hospitalId: finalHospitalId,
            createdBy: req.user._id
        });
        await patient.save();
        const populatedPatient = await Patient.findById(patient._id).populate('hospitalId', 'name');
        res.status(201).json({ message: 'Patient created successfully.', patient: populatedPatient });
    } catch (err) {
        res.status(500).json({ message: 'Error creating patient.', error: err.message });
    }
};

// Update patient
const updatePatient = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Patient id is required.' });
    }
    try {
        let query = { _id: id };
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        // If hospitalId is being changed by superadmin, it's in updateData
        if (req.user.role === 'superadmin' && updateData.hospitalId) {
            query = { _id: id }; // Superadmin can update any patient
        }

        const patient = await Patient.findOneAndUpdate(query, updateData, { new: true }).populate('hospitalId', 'name');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found or not authorized to update.' });
        }
        res.status(200).json({ message: 'Patient updated successfully.', patient });
    } catch (err) {
        res.status(500).json({ message: 'Error updating patient.', error: err.message });
    }
};

// Delete patient
const deletePatient = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Patient id is required.' });
    }
    try {
        let query = { _id: id };
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        const patient = await Patient.findOneAndDelete(query);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found or not authorized to delete.' });
        }
        res.status(200).json({ message: 'Patient deleted successfully.', patientId: id });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting patient.', error: err.message });
    }
};

// Get patient by id
const getPatient = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Patient id is required.' });
    }
    try {
        const patient = await Patient.findOne({ _id: id, hospitalId: req.user.hospitalId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching patient.', error: err.message });
    }
};

// Get all patients with search and pagination
const getAllPatients = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        let query = {};
        // If user is not a superadmin, scope to their hospital
        if (req.user.role !== 'superadmin') {
            query.hospitalId = req.user.hospitalId;
        }

        // Add search functionality
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { phone: regex },
                { email: regex },
            ];
        }

        const patients = await Patient.find(query)
            .populate('hospitalId', 'name')
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Patient.countDocuments(query);

        res.status(200).json({
            patients,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalPatients: count,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching patients.', error: err.message });
    }
};



const Invoice = require('../../Models/Invoice');
const Payment = require('../../Models/Payment');

// Get patient visit/payment history
const getPatientHistory = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Patient id is required.' });
    }
    try {
        const invoices = await Invoice.find({ patientId: id });
        const payments = await Payment.find({ invoiceId: { $in: invoices.map(inv => inv._id) } });
        res.status(200).json({ invoices, payments });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching patient history.', error: err.message });
    }
};

module.exports = { createPatient, updatePatient, deletePatient, getPatient, getAllPatients, getPatientHistory };
