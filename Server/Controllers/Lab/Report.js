const LabReport = require('../../Models/LabReport');
const Patient = require('../../Models/Patient');
const Hospital = require('../../Models/Hospital');
const PDFDocument = require('pdfkit');

// Create lab report
const createLabReport = async (req, res) => {
    const { patientId, testName, result, referenceRange, unit, reportedBy, notes } = req.body;
    if (!patientId || !testName || !result) {
        return res.status(400).json({ message: 'patientId, testName, result are required.' });
    }
    try {
        const report = new LabReport({
            patientId,
            hospitalId: req.user.hospitalId,
            testName,
            result,
            referenceRange,
            unit,
            reportedBy: reportedBy || req.user._id,
            notes
        });
        await report.save();
        res.status(201).json({ message: 'Lab report created successfully.', report });
    } catch (err) {
        res.status(500).json({ message: 'Error creating lab report.', error: err.message });
    }
};

// Update lab report
const updateLabReport = async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Report id is required.' });
    }
    try {
        updateData.updatedAt = new Date();
        const report = await LabReport.findOneAndUpdate({ _id: id, hospitalId: req.user.hospitalId }, updateData, { new: true });
        if (!report) {
            return res.status(404).json({ message: 'Lab report not found.' });
        }
        res.status(200).json({ message: 'Lab report updated successfully.', report });
    } catch (err) {
        res.status(500).json({ message: 'Error updating lab report.', error: err.message });
    }
};

// Delete lab report
const deleteLabReport = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Report id is required.' });
    }
    try {
        const report = await LabReport.findOneAndDelete({ _id: id, hospitalId: req.user.hospitalId });
        if (!report) {
            return res.status(404).json({ message: 'Lab report not found.' });
        }
        res.status(200).json({ message: 'Lab report deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting lab report.', error: err.message });
    }
};

// Get lab report by id
const getLabReport = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Report id is required.' });
    }
    try {
        const report = await LabReport.findOne({ _id: id, hospitalId: req.user.hospitalId });
        if (!report) {
            return res.status(404).json({ message: 'Lab report not found.' });
        }
        res.status(200).json(report);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching lab report.', error: err.message });
    }
};

// Get all lab reports for hospital
const getAllLabReports = async (req, res) => {
    try {
        const reports = await LabReport.find({ hospitalId: req.user.hospitalId });
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching lab reports.', error: err.message });
    }
};

// Generate/download lab report PDF
const generateLabReportPDF = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Report id is required.' });
    }
    try {
        const report = await LabReport.findById(id).populate('patientId').populate('hospitalId').populate('reportedBy');
        if (!report) {
            return res.status(404).json({ message: 'Lab report not found.' });
        }
        // Only lab tech or superadmin or hospital admin can access
        if (
            req.user.role !== 'superadmin' &&
            req.user.role !== 'labtech' &&
            req.user.role !== 'admin' &&
            report.hospitalId._id.toString() !== req.user.hospitalId?.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=labreport_${report._id}.pdf`);
        doc.pipe(res);
        // Header
        doc.fontSize(20).text(report.hospitalId.name, { align: 'center' });
        doc.fontSize(12).text(report.hospitalId.address, { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Lab Report', { align: 'center' });
        doc.moveDown();
        // Patient/Report Info
        doc.fontSize(12).text(`Report ID: ${report._id}`);
        doc.text(`Date: ${report.reportDate.toLocaleDateString()}`);
        doc.text(`Patient: ${report.patientId.firstName} ${report.patientId.lastName}`);
        doc.text(`Test: ${report.testName}`);
        doc.text(`Result: ${report.result} ${report.unit || ''}`);
        if (report.referenceRange) doc.text(`Reference Range: ${report.referenceRange}`);
        doc.text(`Reported By: ${report.reportedBy?.name || ''}`);
        if (report.notes) doc.text(`Notes: ${report.notes}`);
        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Error generating lab report PDF.', error: err.message });
    }
};

module.exports = {
    createLabReport,
    updateLabReport,
    deleteLabReport,
    getLabReport,
    getAllLabReports,
    generateLabReportPDF
};
