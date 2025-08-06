const Invoice = require('../../Models/Invoice');
const Patient = require('../../Models/Patient');
const Hospital = require('../../Models/Hospital');
const PDFDocument = require('pdfkit');

// Generate and stream invoice PDF
const generateInvoicePDF = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Invoice id is required.' });
    }
    try {
        const invoice = await Invoice.findById(id).populate('patientId').populate('hospitalId');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        // Receptionist can only access invoices from their hospital
        if (req.user.role !== 'superadmin' && invoice.hospitalId._id.toString() !== req.user.hospitalId?.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=invoice_${invoice._id}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text(invoice.hospitalId.name, { align: 'center' });
        doc.fontSize(12).text(invoice.hospitalId.address, { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Invoice Info
        doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
        doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
        doc.text(`Patient: ${invoice.patientId.firstName} ${invoice.patientId.lastName}`);
        doc.text(`Phone: ${invoice.patientId.phone}`);
        doc.text(`Email: ${invoice.patientId.email || '-'}`);
        doc.moveDown();

        // Items
        doc.text('Items:');
        invoice.items.forEach((item, idx) => {
            doc.text(`${idx + 1}. ${item.description} - ₹${item.amount}`);
        });
        doc.moveDown();
        doc.fontSize(14).text(`Total: ₹${invoice.total}`, { align: 'right' });
        doc.moveDown();
        doc.text(`Status: ${invoice.status}`);
        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Error generating invoice PDF.', error: err.message });
    }
};

module.exports = { generateInvoicePDF };
