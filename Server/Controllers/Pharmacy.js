const mongoose = require('mongoose');
const Medicine = require('../Models/Medicine');
const PharmacyInvoice = require('../Models/PharmacyInvoice');
const PharmacyReturn = require('../Models/PharmacyReturn');
const Patient = require('../Models/Patient');
const Category = require('../Models/Category');
const Purchase = require('../Models/Purchase');
const User = require('../Models/User');
const { logAction } = require('../Utils/auditLogger');

// --- Inventory Management ---

// Add a new medicine to the inventory
exports.addMedicine = async (req, res) => {
    try {
        // The pharmacist's user object is attached by the verifyTokenAndRole middleware
        const pharmacist = await User.findById(req.user.id);
        if (!pharmacist || !pharmacist.hospitalId) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
        }

        const {
            name,
            description,
            manufacturer,
            unitPrice: bodyUnitPrice,
            salePrice,
            purchasePrice,
            stockQuantity: bodyStock,
            quantity,
            availableQuantity,
            expiryDate,
            supplier,
            category,
            batchNumber,
            generalDrug,
            genericName,
            effects,
            storeBox,
            free,
            cgst,
            sgst,
            igst,
            hsnCode,
        } = req.body;

        // Coerce numeric fields and map defaults
        const numeric = (v) => (v === undefined || v === null || v === '' ? undefined : Number(v));
        const mappedUnitPrice = numeric(bodyUnitPrice) ?? numeric(salePrice);
        let mappedStock = numeric(bodyStock);
        if (mappedStock === undefined) {
            mappedStock = numeric(quantity) ?? numeric(availableQuantity) ?? 0;
        }

        // Basic validation
        if (!name || mappedUnitPrice === undefined || mappedStock === undefined) {
            return res.status(400).json({ message: 'Name, unit price, and stock quantity are required.' });
        }

        // Validate tax percentages
        const inRangePct = (v) => v === undefined || (v >= 0 && v <= 100);
        const nCgst = numeric(cgst);
        const nSgst = numeric(sgst);
        const nIgst = numeric(igst);
        if (!inRangePct(nCgst) || !inRangePct(nSgst) || !inRangePct(nIgst)) {
            return res.status(400).json({ message: 'Tax percentages (CGST/SGST/IGST) must be between 0 and 100.' });
        }

        // Check if medicine with the same name already exists in this hospital
        const existingMedicine = await Medicine.findOne({ name, hospitalId: pharmacist.hospitalId });
        if (existingMedicine) {
            return res.status(409).json({ message: `Medicine '${name}' already exists in your hospital's inventory.` });
        }

        const newMedicine = new Medicine({
            name,
            description,
            manufacturer,
            unitPrice: mappedUnitPrice,
            purchasePrice: numeric(purchasePrice) ?? 0,
            salePrice: numeric(salePrice) ?? mappedUnitPrice,
            stockQuantity: mappedStock,
            quantity: numeric(quantity) ?? mappedStock,
            availableQuantity: numeric(availableQuantity) ?? mappedStock,
            expiryDate,
            supplier,
            category,
            batchNumber,
            generalDrug: !!generalDrug,
            genericName,
            effects,
            storeBox,
            free: numeric(free) ?? 0,
            cgst: nCgst ?? 0,
            sgst: nSgst ?? 0,
            igst: nIgst ?? 0,
            hsnCode,
            hospitalId: pharmacist.hospitalId, // Scope to the pharmacist's hospital
            createdBy: req.user.id,
            updatedBy: req.user.id,
        });

        const savedMedicine = await newMedicine.save();

        await logAction({
            actor: req.user.id,
            action: 'ADD_MEDICINE',
            target: 'Medicine',
            targetId: savedMedicine._id,
            details: { name: savedMedicine.name, quantity: savedMedicine.stockQuantity }
        }, req);

        res.status(201).json({ message: 'Medicine added successfully.', medicine: savedMedicine });

    } catch (error) {
        if (error.code === 11000) { // Mongoose duplicate key error
            return res.status(409).json({ message: `Medicine '${req.body.name}' already exists in your hospital's inventory.` });
        }
        console.error('Error adding medicine:', error);
        res.status(500).json({ message: 'Server error while adding medicine.', error: error.message });
    }
};

// Get low-stock medicines (threshold param, default 10)
exports.getLowStockMedicines = async (req, res) => {
    try {
        const { threshold = 10, page = 1, limit = 10, search = '' } = req.query;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication failed: User not available.' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(401).json({ message: 'Authentication failed: User not found.' });

        let query = { stockQuantity: { $lte: Number(threshold) } };
        if (req.user.role !== 'superadmin') {
            if (!user.hospitalId) return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
            query.hospitalId = user.hospitalId;
        }
        if (search) {
            const regex = { $regex: search, $options: 'i' };
            query.$or = [ { name: regex }, { manufacturer: regex }, { category: regex } ];
        }

        const meds = await Medicine.find(query)
            .sort({ stockQuantity: 1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const count = await Medicine.countDocuments(query);
        res.status(200).json({ medicines: meds, totalPages: Math.ceil(count / Number(limit)), currentPage: Number(page), totalMedicines: count });
    } catch (error) {
        console.error('Error fetching low stock medicines:', error);
        res.status(500).json({ message: 'Server error while fetching low stock medicines.', error: error.message });
    }
};

// --- Categories ---
exports.createCategory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user?.hospitalId && req.user.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required.' });
        const cat = await Category.create({ name: name.trim(), description, hospitalId: user.hospitalId, createdBy: req.user.id });
        res.status(201).json({ message: 'Category created.', category: cat });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Category with this name already exists.' });
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error while creating category.', error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const user = await User.findById(req.user.id);
        let query = {};
        if (req.user.role !== 'superadmin') {
            if (!user?.hospitalId) return res.status(403).json({ message: 'Forbidden' });
            query.hospitalId = user.hospitalId;
        }
        if (search) query.name = { $regex: search, $options: 'i' };
        const cats = await Category.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const count = await Category.countDocuments(query);
        res.status(200).json({ categories: cats, totalPages: Math.ceil(count / Number(limit)), currentPage: Number(page), totalCategories: count });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error while fetching categories.', error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const user = await User.findById(req.user.id);
        const cat = await Category.findById(id);
        if (!cat) return res.status(404).json({ message: 'Category not found.' });
        if (req.user.role !== 'superadmin' && cat.hospitalId.toString() !== user.hospitalId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (name) cat.name = name.trim();
        if (description !== undefined) cat.description = description;
        await cat.save();
        res.status(200).json({ message: 'Category updated.', category: cat });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Category with this name already exists.' });
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error while updating category.', error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);
        const cat = await Category.findById(id);
        if (!cat) return res.status(404).json({ message: 'Category not found.' });
        if (req.user.role !== 'superadmin' && cat.hospitalId.toString() !== user.hospitalId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await Category.deleteOne({ _id: id });
        res.status(200).json({ message: 'Category deleted.' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error while deleting category.', error: error.message });
    }
};

// --- Purchases ---
exports.createPurchase = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user?.hospitalId && req.user.role !== 'superadmin') return res.status(403).json({ message: 'Forbidden' });
        const { supplierName, billNumber, purchaseDate, items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Items are required.' });

        let subtotal = 0, totalTax = 0, totalAmount = 0;
        for (const it of items) {
            const qty = Number(it.quantity);
            const unitCost = Number(it.unitCost);
            if (!it.medicineId || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitCost) || unitCost < 0) {
                return res.status(400).json({ message: 'Each item must include medicineId, quantity>0 and unitCost>=0.' });
            }
            const med = await Medicine.findById(it.medicineId);
            if (!med) return res.status(404).json({ message: `Medicine ${it.medicineId} not found.` });
            med.stockQuantity += qty;
            // Optionally update purchasePrice
            if (unitCost >= 0) med.purchasePrice = unitCost;
            if (it.batchNumber) med.batchNumber = it.batchNumber;
            if (it.expiryDate) med.expiryDate = new Date(it.expiryDate);
            await med.save();

            const line = qty * unitCost;
            const lineTax = ((Number(it.cgst)||0) + (Number(it.sgst)||0) + (Number(it.igst)||0)) / 100 * line;
            subtotal += line;
            totalTax += lineTax;
        }
        totalAmount = subtotal + totalTax;

        const purchase = await Purchase.create({
            supplierName, billNumber, purchaseDate,
            items,
            subtotal, totalTax, totalAmount,
            hospitalId: user.hospitalId,
            createdBy: req.user.id,
        });
        res.status(201).json({ message: 'Purchase recorded and stock updated.', purchase });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ message: 'Server error while creating purchase.', error: error.message });
    }
};

// Get all medicines with pagination and search
exports.getMedicines = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication failed: User not available.' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: User not found.' });
        }

        let query = {};

        // Superadmin can see all medicines, otherwise scope to the user's hospital
        if (req.user.role !== 'superadmin') {
            if (!user.hospitalId) {
                return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
            }
            query.hospitalId = user.hospitalId;
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } },
            ];
        }

        const medicines = await Medicine.find(query)
            .populate('hospitalId', 'name') // Show hospital name
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Medicine.countDocuments(query);

        res.status(200).json({
            medicines,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalMedicines: count,
        });

    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Server error while fetching medicines.', error: error.message });
    }
};

// Update a medicine's details
exports.updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = await User.findById(req.user.id);

        const medicineToUpdate = await Medicine.findById(id);
        if (!medicineToUpdate) {
            return res.status(404).json({ message: 'Medicine not found.' });
        }

        // Check authorization: superadmin or user from the same hospital
        if (req.user.role !== 'superadmin' && medicineToUpdate.hospitalId.toString() !== user.hospitalId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You cannot update medicines for other hospitals.' });
        }

        // If name is being changed, check for duplicates within the same hospital
        if (updateData.name && updateData.name !== medicineToUpdate.name) {
            const existingMedicine = await Medicine.findOne({
                name: updateData.name,
                hospitalId: medicineToUpdate.hospitalId,
                _id: { $ne: id } // Exclude the current document
            });
            if (existingMedicine) {
                return res.status(409).json({ message: `Another medicine with the name '${updateData.name}' already exists.` });
            }
        }

        updateData.updatedBy = req.user.id;

        const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        await logAction({
            actor: req.user.id,
            action: 'UPDATE_MEDICINE',
            target: 'Medicine',
            targetId: updatedMedicine._id,
            details: { updatedFields: Object.keys(updateData) }
        }, req);

        res.status(200).json({ message: 'Medicine updated successfully.', medicine: updatedMedicine });

    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Server error while updating medicine.', error: error.message });
    }
};

// Delete a medicine from inventory
exports.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        const medicineToDelete = await Medicine.findById(id);
        if (!medicineToDelete) {
            return res.status(404).json({ message: 'Medicine not found.' });
        }

        // Check authorization: superadmin or user from the same hospital
        if (req.user.role !== 'superadmin' && medicineToDelete.hospitalId.toString() !== user.hospitalId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You cannot delete medicines from other hospitals.' });
        }

        await Medicine.findByIdAndDelete(id);

        await logAction({
            actor: req.user.id,
            action: 'DELETE_MEDICINE',
            target: 'Medicine',
            targetId: id, // The ID of the deleted document
            details: { name: medicineToDelete.name, manufacturer: medicineToDelete.manufacturer }
        }, req);

        res.status(200).json({ message: `Medicine '${medicineToDelete.name}' deleted successfully.` });

    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Server error while deleting medicine.', error: error.message });
    }
};

// --- Billing / Invoicing ---

// Create a new pharmacy invoice (no transactions for standalone Mongo)
exports.createInvoice = async (req, res) => {
    try {
        const { patientId, items, paymentMethod, status } = req.body;
        const pharmacist = await User.findById(req.user.id);

        if (!pharmacist || !pharmacist.hospitalId) {
            return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
        }

        if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Patient ID and a non-empty items array are required.' });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // Enforce credit only for admitted patients
        if (paymentMethod === 'Credit' && !patient.admitted) {
            return res.status(400).json({ message: 'Credit sales are allowed only for admitted patients.' });
        }

        // Defaults if not provided
        const finalPaymentMethod = paymentMethod || 'Cash';
        const finalStatus = status || (finalPaymentMethod === 'Credit' ? 'Unpaid' : 'Paid');

        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const qty = Number(item.quantity);
            if (!item.medicineId || !Number.isFinite(qty) || qty <= 0) {
                return res.status(400).json({ message: 'Each item must include a valid medicineId and quantity > 0.' });
            }
            const medicine = await Medicine.findById(item.medicineId);
            if (!medicine) {
                return res.status(404).json({ message: `Medicine with ID ${item.medicineId} not found.` });
            }
            if (medicine.stockQuantity < qty) {
                return res.status(400).json({ message: `Not enough stock for ${medicine.name}. Available: ${medicine.stockQuantity}, Requested: ${qty}` });
            }

            medicine.stockQuantity -= qty;
            await medicine.save();

            const itemTotalPrice = medicine.unitPrice * qty;
            totalAmount += itemTotalPrice;

            processedItems.push({
                medicineId: medicine._id,
                name: medicine.name,
                quantity: qty,
                unitPrice: medicine.unitPrice,
                totalPrice: itemTotalPrice,
            });
        }

        const newInvoice = new PharmacyInvoice({
            patient: patientId,
            items: processedItems,
            totalAmount,
            paymentMethod: finalPaymentMethod,
            status: finalStatus,
            hospitalId: pharmacist.hospitalId,
            pharmacistId: req.user.id,
        });

        // The pre-save hook will generate the invoiceNumber
        const savedInvoice = await newInvoice.save();

        await logAction({
            actor: req.user.id,
            action: 'CREATE_PHARMACY_INVOICE',
            target: 'PharmacyInvoice',
            targetId: savedInvoice._id,
            details: { patientId, totalAmount, itemCount: items.length }
        }, req);

        res.status(201).json({ message: 'Invoice created successfully.', invoice: savedInvoice });

    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Server error while creating invoice.', error: error.message });
    }
};

// Get all invoices for the hospital with pagination and search
exports.getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const user = await User.findById(req.user.id);

        let query = {};

        if (req.user.role !== 'superadmin') {
            if (!user.hospitalId) {
                return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
            }
            query.hospitalId = user.hospitalId;
        }

        if (search) {
            // Find patients matching the search first across common fields
            const regex = { $regex: search, $options: 'i' };
            const matchingPatients = await Patient.find({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { phone: regex },
                ]
            }).select('_id');
            const patientIds = matchingPatients.map(p => p._id);

            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { patient: { $in: patientIds } },
            ];
        }

        const invoices = await PharmacyInvoice.find(query)
            .populate('patient', 'firstName lastName name email phone')
            .populate('pharmacistId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await PharmacyInvoice.countDocuments(query);

        res.status(200).json({
            invoices,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalInvoices: count,
        });

    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Server error while fetching invoices.', error: error.message });
    }
};

// Get a single invoice by its ID
exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        const invoice = await PharmacyInvoice.findById(id)
            .populate('patient', 'name email phone address')
            .populate('pharmacistId', 'name')
            .populate('hospitalId', 'name address')
            .populate('items.medicineId', 'name manufacturer category'); // Populate medicine details within items

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }

        // Security check: Ensure user is superadmin or belongs to the same hospital as the invoice
        if (req.user.role !== 'superadmin' && invoice.hospitalId._id.toString() !== user.hospitalId.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this invoice.' });
        }

        res.status(200).json(invoice);

    } catch (error) {
        console.error('Error fetching invoice by ID:', error);
        res.status(500).json({ message: 'Server error while fetching invoice.', error: error.message });
    }
};

// --- Returns ---

// Process a new return
exports.createReturn = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { originalInvoiceId, returnedItems, reason } = req.body;
        const user = await User.findById(req.user.id).session(session);

        if (!user || !user.hospitalId) {
            await session.abortTransaction();
            return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
        }

        if (!originalInvoiceId || !returnedItems || !Array.isArray(returnedItems) || returnedItems.length === 0 || !reason) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Original invoice ID, returned items, and a reason are required.' });
        }

        const originalInvoice = await PharmacyInvoice.findById(originalInvoiceId).session(session);
        if (!originalInvoice) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Original invoice not found.' });
        }

        if (originalInvoice.hospitalId.toString() !== user.hospitalId.toString() && req.user.role !== 'superadmin') {
            await session.abortTransaction();
            return res.status(403).json({ message: 'Forbidden: You cannot process returns for other hospitals.' });
        }

        let totalRefundAmount = 0;

        for (const itemToReturn of returnedItems) {
            const soldItem = originalInvoice.items.find(i => i.medicineId.toString() === itemToReturn.medicineId);
            if (!soldItem) {
                throw new Error(`Medicine with ID ${itemToReturn.medicineId} was not found on the original invoice.`);
            }
            if (soldItem.quantity < itemToReturn.quantity) {
                throw new Error(`Cannot return more items than were purchased for ${soldItem.name}.`);
            }

            // Increase stock quantity
            await Medicine.updateOne({ _id: itemToReturn.medicineId }, { $inc: { stockQuantity: itemToReturn.quantity } }).session(session);

            totalRefundAmount += soldItem.unitPrice * itemToReturn.quantity;
        }

        const newReturn = new PharmacyReturn({
            originalInvoiceId,
            returnedItems,
            totalRefundAmount,
            reason,
            hospitalId: user.hospitalId,
            processedBy: req.user.id,
        });

        const savedReturn = await newReturn.save({ session });

        // Update original invoice status
        const totalItemsInInvoice = originalInvoice.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalItemsReturned = returnedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        // This logic needs to be more robust by checking previous returns against this invoice
        // For now, we'll assume this is the first return against this invoice
        if (totalItemsReturned >= totalItemsInInvoice) {
            originalInvoice.status = 'Returned';
        } else {
            originalInvoice.status = 'Partially Returned';
        }
        await originalInvoice.save({ session });

        await logAction({
            actor: req.user.id,
            action: 'CREATE_PHARMACY_RETURN',
            target: 'PharmacyReturn',
            targetId: savedReturn._id,
            details: { originalInvoiceId, totalRefundAmount, reason }
        }, req);

        await session.commitTransaction();
        res.status(201).json({ message: 'Return processed successfully.', 'return': savedReturn });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error processing return:', error);
        res.status(500).json({ message: 'Server error while processing return.', error: error.message });
    } finally {
        session.endSession();
    }
};

// Get all returns for the hospital
exports.getReturns = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const user = await User.findById(req.user.id);

        let query = {};

        // Scope to hospital unless superadmin
        if (req.user.role !== 'superadmin') {
            if (!user.hospitalId) {
                return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
            }
            query.hospitalId = user.hospitalId;
        }

        // Search by original invoice number
        if (search) {
            const matchingInvoices = await PharmacyInvoice.find({
                invoiceNumber: { $regex: search, $options: 'i' }
            }).select('_id');

            const invoiceIds = matchingInvoices.map(inv => inv._id);

            query.originalInvoiceId = { $in: invoiceIds };
        }

        const returns = await PharmacyReturn.find(query)
            .populate({
                path: 'originalInvoiceId',
                select: 'invoiceNumber patient totalAmount',
                populate: {
                    path: 'patient',
                    select: 'name'
                }
            })
            .populate('processedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await PharmacyReturn.countDocuments(query);

        res.status(200).json({
            returns,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalReturns: count,
        });

    } catch (error) {
        console.error('Error fetching returns:', error);
        res.status(500).json({ message: 'Server error while fetching returns.', error: error.message });
    }
};

// --- Patients (Pharmacy scoped) ---
// Lightweight patient search for pharmacists within their hospital
exports.getPharmacyPatients = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication failed: User not available.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: User not found.' });
        }

        let query = {};

        // Superadmin can search across hospitals; others restricted to their hospital
        if (req.user.role !== 'superadmin') {
            if (!user.hospitalId) {
                return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
            }
            query.hospitalId = user.hospitalId;
        }

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { phone: regex },
            ];
        }

        const patientsDocs = await Patient.find(query)
            .select('firstName lastName email phone admitted hospitalId')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        // Add a combined display name to each patient
        const patients = patientsDocs.map(p => ({
            _id: p._id,
            firstName: p.firstName,
            lastName: p.lastName,
            name: `${p.firstName} ${p.lastName}`.trim(),
            email: p.email,
            phone: p.phone,
            admitted: !!p.admitted,
            hospitalId: p.hospitalId,
        }));

        const count = await Patient.countDocuments(query);

        res.status(200).json({
            patients,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalPatients: count,
        });
    } catch (error) {
        console.error('Error fetching pharmacy patients:', error);
        res.status(500).json({ message: 'Server error while fetching patients.', error: error.message });
    }
};

// --- Dashboard ---

// @desc    Get pharmacy dashboard statistics
// @route   GET /api/pharmacy/dashboard-stats
// @access  Private (Pharmacist, Admin, Superadmin)
exports.getDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        // Superadmin can see all stats, otherwise scope to the user's hospital
        if (req.user.role !== 'superadmin') {
            if (!user.hospitalId) {
                return res.status(403).json({ message: 'Forbidden: You are not assigned to a hospital.' });
            }
            query.hospitalId = user.hospitalId;
        }

        const totalMedicines = await Medicine.countDocuments(query);
        
        const lowStockQuery = { ...query, stockQuantity: { $lt: 10 } }; // Low stock threshold: 10
        const lowStock = await Medicine.countDocuments(lowStockQuery);
        
        const salesAggregationPipeline = [
            { $match: query }, // Match documents for the specific hospital or all if superadmin
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 }, // Counts number of invoices
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ];
        
        const salesData = await PharmacyInvoice.aggregate(salesAggregationPipeline);

        const recentInvoices = await PharmacyInvoice.find(query)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patient', 'firstName lastName name');

        const lowStockItems = await Medicine.find(lowStockQuery)
            .sort({ stockQuantity: 1 })
            .limit(5);

        res.status(200).json({
            totalMedicines,
            lowStock,
            totalSales: salesData[0]?.totalSales || 0,
            totalRevenue: salesData[0]?.totalRevenue || 0,
            recentInvoices,
            lowStockItems,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
